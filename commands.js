import "dotenv/config";
import {
  APPLICATION_COMMAND_TYPE,
  APPLICATION_COMMAND_OPTION_TYPE,
} from "./definitions/application-commands.js";
import { InstallGlobalCommands } from "./lib/utils.js";

const TRIVIA_COMMAND = {
  name: "trivia",
  description:
    "Play this trivia to learn facts about veganism and prepare for debates!",
  type: APPLICATION_COMMAND_TYPE.CHAT_INPUT,
};

const RECIPES_COMMAND = {
  name: "recipes",
  description: "Find out what other people like to cook/bake!",
  type: APPLICATION_COMMAND_TYPE.CHAT_INPUT,
};

const IMPACT_COMMAND = {
  name: "impact",
  description: "Discover the impact of going vegan!",
  type: APPLICATION_COMMAND_TYPE.CHAT_INPUT,
  options: [
    {
      type: APPLICATION_COMMAND_OPTION_TYPE.STRING,
      name: "of",
      description: "see impact of server or yourself",
      choices: [
        {
          name: "server",
          value: "server",
        },
        {
          name: "self",
          value: "self",
        },
      ],
    },
  ],
};

const PLEDGE_COMMAND = {
  name: "pledge",
  description: "Pledge to go veg!",
  type: APPLICATION_COMMAND_TYPE.CHAT_INPUT,
  options: [
    {
      type: APPLICATION_COMMAND_OPTION_TYPE.STRING,
      name: "veg_status",
      description: "Veg Status",
      required: true,
      choices: [
        {
          name: "vegan",
          value: "vegan",
        },
      ],
    },
    {
      type: APPLICATION_COMMAND_OPTION_TYPE.STRING,
      name: "unit",
      description: "Unit of time measurement.",
      required: true,
      choices: [
        {
          name: "day",
          value: "day",
        },
        {
          name: "week",
          value: "week",
        },
        {
          name: "month",
          value: "month",
        },
        {
          name: "year",
          value: "year",
        },
        {
          name: "forever",
          value: "forever",
        },
      ],
    },
    {
      type: APPLICATION_COMMAND_OPTION_TYPE.NUMBER,
      min_value: 1,
      name: "value",
      description: "How many time units are you pledging?",
    },
  ],
};

const PLEDGED_COMMAND = {
  name: "pledged",
  description: "Log a previous veg pledge you have taken!",
  type: APPLICATION_COMMAND_TYPE.CHAT_INPUT,
  required: true,
  options: [
    {
      type: APPLICATION_COMMAND_OPTION_TYPE.STRING,
      name: "veg_status",
      description: "Veg Status",
      required: true,
      choices: [
        {
          name: "vegan",
          value: "vegan",
        },
      ],
    },
    {
      type: APPLICATION_COMMAND_OPTION_TYPE.STRING,
      name: "unit",
      description: "Unit of time measurement.",
      required: true,
      choices: [
        {
          name: "day",
          value: "day",
        },
        {
          name: "week",
          value: "week",
        },
        {
          name: "month",
          value: "month",
        },
        {
          name: "year",
          value: "year",
        },
        {
          name: "forever",
          value: "forever",
        },
      ],
    },
    {
      type: APPLICATION_COMMAND_OPTION_TYPE.INTEGER,
      min_value: 1,
      name: "value",
      description: "How many time units are you pledging?",
    },
  ],
};

const ALL_COMMANDS = [
  TRIVIA_COMMAND,
  RECIPES_COMMAND,
  IMPACT_COMMAND,
  PLEDGE_COMMAND,
  PLEDGED_COMMAND,
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
