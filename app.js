import "dotenv/config";
import express from "express";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";
import { VerifyDiscordRequest, DiscordRequest } from "./lib/utils.js";
import { getUserImpact, pledge, USER_IMPACT_STATUS } from "./lib/impact.js";
import { VEG_STATUS } from "./definitions/users.js";

const MAX_SQLITE_UNIX_EPOCH = 253402214400;
const MAX_DATE_VALUE = 8640000000000000;

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

const users = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post("/interactions", async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "impact" command
    if (name === "impact") {
      const userId = req.body.member.user.id;
      getUserImpact(userId, (status, data) => {
        if (status === USER_IMPACT_STATUS.OK) {
          // Send a message into the channel where command was triggered from
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `You have saved ${data.animals} animals! :pig:`,
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        } else if (status === USER_IMPACT_STATUS.NO_RECORD) {
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `We have no record of you taking a veg pledge. Use /pledge if you are just going veg, or /pledged if you are already veg!`,
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }
      });
    }

    // pledge command
    if (name === "pledge") {
      // generate dictionary of values passed into application command
      const options = {};
      for (const option of data.options) {
        options[option.name] = option.value;
      }

      const vegStatusConversions = {
        vegan: VEG_STATUS.VEGAN,
      };
      const unitDayConversions = {
        day: 1,
        week: 7,
        month: 31,
        year: 365,
      };

      // get information from command to send to database
      const userId = req.body.member.user.id;
      const vegStatus = vegStatusConversions[options.veg_status];
      let startDate = Date.now();
      let endDate;

      if (options.unit === "forever") {
        endDate = new Date(
          Math.min(MAX_SQLITE_UNIX_EPOCH * 1000, MAX_DATE_VALUE),
        );
      } else {
        endDate = new Date(
          startDate.valueOf() +
            unitDayConversions[options.unit] *
              (options.value || 1) *
              24 *
              60 *
              60 *
              1000,
        );
      }

      // send pledge to database
      pledge(userId, vegStatus, startDate, endDate, (status) => {
        res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `${status === USER_IMPACT_STATUS.OK ? "Awesome! " : ""}Your pledge was ${status === USER_IMPACT_STATUS.OK ? "successful!" : "unsuccessful.\nTry checking if you are already on a pledge, and use /extendpledge if you would like to extend it."}`,
          },
        });
      });
    }

    // pledged command
    if (name === "pledged") {
      // generate dictionary of values passed into application command
      const options = {};
      for (const option of data.options) {
        options[option.name] = option.value;
      }

      const vegStatusConversions = {
        vegan: VEG_STATUS.VEGAN,
      };
      const unitDayConversions = {
        day: 1,
        week: 7,
        month: 31,
        year: 365,
      };

      // save important data to users data to be used after modal submit
      const userId = req.body.member.user.id;
      const vegStatus = vegStatusConversions[options.veg_status];
      let endOffset;

      if (options.unit === "forever") {
        endOffset = Infinity;
      } else {
        endOffset =
          unitDayConversions[options.unit] *
          (options.value || 1) *
          24 *
          60 *
          60 *
          1000;
      }

      if (!users[req.body.member.user.id]) {
        users[req.body.member.user.id] = {};
      }
      users[req.body.member.user.id]["pledgedCommandData"] = {
        vegStatus: vegStatus,
        userId: userId,
        endOffset: endOffset,
      };

      // submit modal
      return res.send({
        type: InteractionResponseType.MODAL,
        data: {
          custom_id: "pledged_start",
          title: "When did you start your pledge?",
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.INPUT_TEXT,
                  label: "Year you went veg. e.g. 2021",
                  style: 1,
                  custom_id: "pledged_start_year",
                },
              ],
            },
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.INPUT_TEXT,
                  label: "Month you went veg (1-12)",
                  style: 1,
                  custom_id: "pledged_start_month",
                },
              ],
            },
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.INPUT_TEXT,
                  label: "Date you went veg (1-31)",
                  style: 1,
                  custom_id: "pledged_start_date",
                },
              ],
            },
          ],
        },
      });
    }

    // "trivia" command
    if (name === "trivia") {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: "Trivia is unsupported right now, sorry!",
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }
    // "recipes" command
    if (name === "recipes") {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: "Recipes is unsupported right now, sorry!",
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }
  }

  if (type === InteractionType.MODAL_SUBMIT) {
    if (data.custom_id === "pledged_start") {
      // validate year/month/date
      const commandData = users[req.body.member.user.id]["pledgedCommandData"];
      const yearComponent = req.body.data.components[0].components[0];
      const monthComponent = req.body.data.components[1].components[0];
      const dateComponent = req.body.data.components[2].components[0];

      const year = parseInt(yearComponent.value);
      const month = parseInt(monthComponent.value) - 1;
      const date = parseInt(dateComponent.value);
      if (!year || !month || !date) {
        return respondInvalidModalDate(res);
      }

      const yearValid = year > 1900 && year < new Date().getFullYear();
      const monthValid = month >= 0 && month <= 11;
      const dateBoundaries = [
        31,
        (year - 1900) % 4 === 0 ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
      ];
      if (
        !yearValid ||
        !monthValid ||
        date < 1 ||
        date > dateBoundaries[month]
      ) {
        return respondInvalidModalDate(res);
      }

      // create date objects
      const startDate = new Date(year, month, date);
      let endDate;
      if (commandData.endOffset === Infinity) {
        endDate = new Date(
          Math.min(MAX_SQLITE_UNIX_EPOCH * 1000, MAX_DATE_VALUE),
        );
      } else {
        endDate = new Date(startDate.valueOf() + endOffset);
      }

      // send pledge to database
      pledge(
        commandData.userId,
        commandData.vegStatus,
        startDate,
        endDate,
        (status) => {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `${status === USER_IMPACT_STATUS.OK ? "Awesome! " : ""}Your pledge was ${status === USER_IMPACT_STATUS.OK ? "successful!" : "unsuccessful.\nTry checking if you are already on a pledge, and use /extendpledge if you would like to extend it."}`,
            },
          });
        },
      );
    }
  }
});

function respondInvalidModalDate(res) {
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    datea: {
      content: `Failed to pledge, invalid date inputted`,
    },
  });
}

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
