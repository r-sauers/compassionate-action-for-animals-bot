/**
 *  Drops the users and pledges tables, and recreates them.
 */
import sqlite3 from "sqlite3";

let db = new sqlite3.Database("./db/users.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the in-memory SQLite database.");
});

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
    );
});

db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Closed the database connection.");
});
