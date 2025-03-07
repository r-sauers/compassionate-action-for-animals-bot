/**
 *  Seeds the database with the pledges Ryan has made.
 */
import { VEG_STATUS } from "./definitions/users.js";
import { generateInsertSQL } from "./lib/utils.js";
import sqlite3 from "sqlite3";

let db = new sqlite3.Database("./db/users.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the in-memory SQLite database.");
});

const seedUsers = [
  {
    discord_id: "565645061526913027",
  },
];

const seedPledges = [
  {
    pledger_id: 1,
    veg_status: VEG_STATUS.VEGAN,
    start_date: new Date(2020, 2, 31),
    end_date: new Date(2124, 0, 1),
  },
];

const usersValues = [];
const pledgesValues = [];
const usersSQL = generateInsertSQL("users", seedUsers, usersValues);
const pledgesSQL = generateInsertSQL("pledges", seedPledges, pledgesValues);

console.log("For insertion of users, using:", usersSQL);
console.log("For insertion of pledges, using:", pledgesSQL);

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS users", (err) => {
    if (err) {
      console.log("Failed to drop users table");
      return console.error(err.message);
    }
    console.log("Table dropped");
  })
    .run("DROP TABLE IF EXISTS pledges", (err) => {
      if (err) {
        console.log("Failed to drop pledges table");
        return console.error(err.message);
      }
      console.log("Table dropped");
    })
    .run(
      "CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, discord_id TEXT)",
      (err) => {
        if (err) {
          console.log("Failed to make table.");
          return console.error(err.message);
        }
        console.log("Created Table");
      },
    )
    .run(
      "CREATE TABLE pledges(id INTEGER PRIMARY KEY AUTOINCREMENT, pledger_id INTEGER NOT NULL, veg_status INTEGER NOT NULL, start_date INTEGER NOT NULL, end_date INTEGER NOT NULL)",
      (err) => {
        if (err) {
          console.log("Failed to make table.");
          return console.error(err.message);
        }
        console.log("Created Table");
      },
    )
    .run(usersSQL, usersValues, (err) => {
      if (err) {
        console.log("Failed to add user");
        return console.error(err.message);
      }
      console.log("Added user");
    })
    .run(pledgesSQL, pledgesValues, (err) => {
      if (err) {
        console.log("Failed to add user");
        return console.error(err.message);
      }
      console.log("Added user");
    })
    .all("SELECT * from users", [], (err, rows) => {
      if (err) {
        throw err;
      }

      rows.forEach((row) => {
        console.log(row);
      });
    });
});

db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Closed the database connection.");
});
