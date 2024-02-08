import sqlite3 from "sqlite3";
import { VEG_STATUS } from "../definitions/users.js";
import { generateInsertSQL } from "./utils.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Used to return statuses of pledge and getUserImpact
export const USER_IMPACT_STATUS = {
  NO_RECORD: 0,
  OK: 1,
  FAILED: 2,
};

/**
 * Adds discord user with to table if they are not already in the table.
 * @param {String} user_id is the discord id of the user.
 * @param {sqlite3.Database} db is the database to query.
 * @param {function(err): void} callback
 */
function validateUser(user_id, db, callback) {
  const sql2 = `
INSERT INTO users(discord_id)
SELECT
  '${user_id}'
WHERE
  NOT EXISTS (
    SELECT
      1
    FROM
      users
    WHERE
      discord_id='${user_id}'
);`;
  db.run(sql2, [], function (err) {
    if (err) {
      console.error("Failed to validate user!");
    }
    callback(err);
  });
}

/**
 * Adds a discord user's pledge to go veg to the database.
 * NOTE: database insert will fail if the pledge time interval overlaps with any other
 * pledges of the discord user.
 *
 * @param {String} user_id is the discord id of the user
 * @param {VEG_STATUS} vegStatus is the type of pledge (vegan, vegetarian, etc)
 * @param {Date} startDate is the start date of the pledge
 * @param {Date} endDate is the end date of the pledge
 * @param {function(status: USER_IMPACT_STATUS): void} callback
 */
export function pledge(user_id, vegStatus, startDate, endDate, callback) {
  const db = new sqlite3.Database(__dirname + "/../db/users.db", (err) => {
    if (err) {
      console.error("Error loading database.");
      throw err;
    }
  });
  validateUser(user_id, db, (err) => {
    const startUnixEpoch = startDate.valueOf() / 1000;
    const endUnixEpoch = endDate.valueOf() / 1000;
    const sql = `
INSERT INTO pledges(pledger_id, veg_status, start_date, end_date) 
SELECT 
id,
${vegStatus},
date(${startUnixEpoch}, 'unixepoch'), 
date(${endUnixEpoch}, 'unixepoch') 
FROM
users
WHERE 
discord_id='${user_id}' AND NOT EXISTS (
  SELECT 
    1 
  FROM 
    pledges 
  WHERE 
    unixepoch(start_date) <= unixepoch(
      date(${endUnixEpoch}, 'unixepoch')
    ) 
    AND unixepoch(end_date) >= unixepoch(
      date(${startUnixEpoch}, 'unixepoch')
    )
);`;

    db.run(sql, [], function (err) {
      if (err) {
        console.error("Error inserting pledge into database");
        throw err;
      }
      if (this.changes == 1) {
        callback(USER_IMPACT_STATUS.OK);
      } else {
        callback(USER_IMPACT_STATUS.FAILED);
      }
    });
  });

  db.close();
}

/**
 * Gets the impact a user has made for animals and the environment based on their pledges.
 * status will be USER_IMPACT_STATUS.NO_RECORD if the user has no record of pledges
 *
 * @param {String} user_id is the discord id of the user
 * @param {function(status: USER_IMPACT_STATUS, data: null | { animals: int })} callback
 */
export function getUserImpact(user_id, callback) {
  const db = new sqlite3.Database(__dirname + "/../db/users.db", (err) => {
    if (err) {
      console.error("Error loading database.");
      throw err;
    }
  });

  validateUser(user_id, db, (err) => {
    const sql = `
SELECT 
  SUM(
    (
      min(
        unixepoch(pledges.end_date), 
        unixepoch(
          date()
        )
      ) - unixepoch(pledges.start_date)
    ) / (60 * 60 * 24)
  ) AS days
FROM 
  pledges
  INNER JOIN users ON pledges.pledger_id=users.id
WHERE
  discord_id = ${user_id};`;

    db.get(sql, [], function (err, row) {
      if (err) {
        console.error(
          "Error querying number of days user was vegan from database.",
        );
        throw err;
      }
      if (!row.days) {
        callback(USER_IMPACT_STATUS.NO_RECORD);
        return;
      }
      const impact = {
        animals: row.days * 1,
      };
      callback(USER_IMPACT_STATUS.OK, impact);
    });
  });

  db.close();
}
