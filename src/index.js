#!/usr/bin/env node

import inquirer from "inquirer";
import dotenv from "dotenv";
import { getCallHistory } from "./helpers/gong.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

// Get the directory name of the current module
// Load environment variables with specific path
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

async function main() {
  while (true) {
    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: [
          "Get Call History",
          "Get Call Video",
          "Get Call Transcription",
          "Exit",
        ],
      },
    ]);

    if (choice === "Exit") {
      console.log("Goodbye!");
      break;
    }

    switch (choice) {
      case "Get Call History":
        const history = await getCallHistory();

        const jsonData = JSON.stringify(history, null, 2);
        fs.writeFile("gong_calls.json", jsonData, (err) => {
          if (err) {
            console.error("Error writing file:", err);
          } else {
            console.log("Data written to file successfully");
          }
        });

        break;
      case "Get Call Video":
        await getCallVideo();
        break;
      case "Get Call Transcription":
        await getCallTranscription();
        break;
    }
  }
}

main().catch(console.error);
