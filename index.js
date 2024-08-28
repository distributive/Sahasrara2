import { config } from "dotenv";
import { start } from "./src/Structures/client.js";

config(); // Load .env
start(); // Start the bot
