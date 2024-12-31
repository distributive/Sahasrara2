/**
 * A module for handling local database storage.
 *
 * @file   This files defines the Database/database module.
 * @since  1.0.0
 */

///////////////////////////////////////////////////////////////////////////////

import mysql from "mysql";
import { logError } from "../Utility/error.js";

///////////////////////////////////////////////////////////////////////////////

let DB; // Persistent database connection

/**
 * Database schema:
 * 
 * IsONR [0: false, 1: true]
 * QueryType [0: text, 1: image, 2: flavour, 3: legality]
 * 
  CREATE TABLE Query (
    ID INT NOT NULL AUTO_INCREMENT,
    Query VARCHAR(255) NOT NULL,
    CardId VARCHAR(60) NOT NULL,
    PrintingId VARCHAR(8) NOT NULL,
    ChannelType BIT(5) NOT NULL,
    IsONR BIT(1) NOT NULL,
    QueryType BIT(2) NOT NULL,
    Timestamp DATETIME NOT NULL,
    PRIMARY KEY (ID)
  );
 */

export async function init() {
  DB = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: false,
  });

  DB.connect(function (err) {
    if (err) {
      logError(err);
    }
  });
}

/**
 * Saves a user's card query to the database.
 *
 * @param {string} query The raw query submitted.
 * @param {string} cardId The card ID of the fetched card.
 * @param {string} printingId The printing ID of the fetched card.
 * @param {number} channelType A flag representing the type of channel the request was sent from.
 * @param {number} isOnr Is this an ONR card?.
 * @param {number} queryType A flag representing if the request was for text, image, flavour text, or legality.
 */
export function logQuery(
  query,
  cardId,
  printingId,
  channelType,
  isOnr,
  queryType
) {
  const sql = "INSERT INTO Query SET ?";
  const values = {
    Query: query.substring(0, 255),
    CardId: cardId.substring(0, 60),
    PrintingId: printingId.substring(0, 8),
    ChannelType: channelType,
    IsONR: isOnr ? 1 : 0,
    QueryType: queryType,
    Timestamp: new Date(),
  };
  DB.query(sql, values, function (err, result) {
    if (err) {
      logError(err);
    }
  });
}
