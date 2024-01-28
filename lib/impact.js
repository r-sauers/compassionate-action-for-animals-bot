import sqlite3 from "sqlite3";
import { VEG_STATUS } from "../definitions/users.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const USER_IMPACT_STATUS = {
  NO_TABLE_ENTRY: 0,
  NOT_VEG: 1,
  CANNOT_COMPUTE: 2,
  NO_BIRTH_SET: 3,
  OK: 4,
};

export function getUserImpact(user_id, callback) {
  const db = new sqlite3.Database(__dirname + "/../db/users.db", (err) => {
    if (err) {
      console.log("Error loading database.");
      throw err;
    }
  });

  db.get("SELECT * FROM users WHERE discord_id = ?", [user_id], (err, row) => {
    if (err) {
      console.log("Error selecting from database.");
      throw err;
    }

    if (!row) {
      callback(USER_IMPACT_STATUS.NO_TABLE_ENTRY, null);
      return;
    }

    if (row.veg_status == VEG_STATUS.OMNI) {
      callback(USER_IMPACT_STATUS.NOT_VEG, null);
      return;
    } else if (row.veg_status == VEG_STATUS.VEGAN) {
      if (!row.veg_birth_set) {
        callback(USER_IMPACT_STATUS.NO_BIRTH_SET, null);
        return;
      }

      const { veg_birth_date, veg_birth_month, veg_birth_year } = row;
      const veganBirthdate = new Date(
        veg_birth_year,
        veg_birth_month,
        veg_birth_date,
      );
      const now = Date.now();
      const days =
        (now.valueOf() - veganBirthdate.valueOf()) / (1000 * 60 * 60 * 24);

      const data = {
        animals: Math.floor(days * 1),
      };

      callback(USER_IMPACT_STATUS.OK, data);
      return;
    } else {
      callback(USER_IMPACT_STATUS.CANNOT_COMPUTE, null);
    }
  });
  db.close();
}
