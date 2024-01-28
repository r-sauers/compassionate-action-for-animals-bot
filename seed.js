import { VEG_STATUS } from "./definitions/users.js";
import sqlite3 from "sqlite3";

let db = new sqlite3.Database("./db/users.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the in-memory SQLite database.");
});

db.serialize(() => {

  db.run('DROP TABLE IF EXISTS users', (err) => {
    if (err) {
      console.log("Failed to drop table");
      return console.error(err.message);
    }
    console.log("Table dropped");
  }).run('CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, discord_id TEXT, veg_birth_year INTEGER, veg_birth_month INTEGER, veg_birth_date INTEGER, veg_status INTEGER NOT NULL DEFAULT 0, veg_birth_set INTEGER NOT NULL DEFAULT 0)', (err) => {
    if (err) {
      console.log("Failed to make table.");
      return console.error(err.message);
    }
    console.log("Created Table");
  }).run('INSERT INTO users(discord_id, veg_status, veg_birth_set, veg_birth_year, veg_birth_month, veg_birth_date) VALUES(?, ?, ?, ?, ?, ?)', ["565645061526913027", VEG_STATUS.VEGAN, 1, 2020, 2, 31], (err) => {
      if (err) {
        console.log("Failed to add user");
        return console.error(err.message);
      }
      console.log("Added user");
    }).all('SELECT * from users', [], (err, rows) => {
      if (err) {
        throw err;
      }

      rows.forEach((row) => {
        console.log(row);
      })
    })
});

db.close( (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Closed the database connection.")
});
