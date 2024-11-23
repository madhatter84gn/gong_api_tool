import chalk from "chalk";
import inquirer from "inquirer";
import { saveToFile } from "../utils/file.js";
import { getAllCalls, getCallDetails, getCallAssets } from "../api/client.js";
import {
  createAsyncFunction,
  tryCatch,
  withSpinner,
} from "../utils/functional.js";

export const getAllRawCallHistory = async ({ filename }) => {
  // Create an async function to fetch and save call history
  const fetchAndSaveCallHistory = async () => {
    const calls = await getAllCalls();
    return saveToFile(filename, calls);
  };

  // Wrap the function with error handling
  const handleCallHistory = tryCatch(
    createAsyncFunction(fetchAndSaveCallHistory),
    (error) => {
      console.error(chalk.red(error.message));
      process.exit(1);
    },
  );

  // Add spinner with error handling
  const processWithSpinner = withSpinner("Fetching call history...")(
    handleCallHistory,
  );

  // Execute the process
  await processWithSpinner();
};

export const getAllExtensiveCallHistory = async ({ filename }) => {
  // Create an async function to fetch and save call history
  const fetchAndSaveCallHistory = async () => {
    const calls = await getCallDetails();
    return saveToFile(filename, calls);
  };

  // Wrap the function with error handling
  const handleCallHistory = tryCatch(
    createAsyncFunction(fetchAndSaveCallHistory),
    (error) => {
      console.error(chalk.red(error.message));
      process.exit(1);
    },
  );

  // Add spinner with error handling
  const processWithSpinner = withSpinner("Fetching call history...")(
    handleCallHistory,
  );

  // Execute the process
  await processWithSpinner();
};

export const getAllCallAssets = async ({ filename }) => {
  const fetchAndSaveCallAssets = async () => {
    // Create an async function to fetch and save call history
    //TODO:
    //1. Load the extensive call json file
    const callHistory = await getCallAssets(filename);
    console.log(callHistory.length);
    return callHistory;
    //2. Foreach call
    //3. create folder structure
    //4. get video download
    //5. name it appropriately
    //6. write the stream
    //7 repeat 5-7 for audio files
    //8. once download successful write to a report so that if we need to batch this we know where we left off
  };
  const handleAssetRetrieval = tryCatch(
    createAsyncFunction(fetchAndSaveCallAssets),
    (error) => {
      console.error(chalk.red(error.message));
      process.exit(1);
    },
  );

  // Add spinner with error handling
  const processWithSpinner = withSpinner("Fetching call assets...")(
    handleAssetRetrieval,
  );

  // Execute the process
  await processWithSpinner();
};

export const interactive = async () => {
  console.log(chalk.blue("Welcome to Call History CLI"));

  const getAction = async () => {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "Get All Raw Call History",
          "Get Extensive Call History",
          "Download Audio/Video Assets",
          "Exit",
        ],
      },
    ]);
    return action;
  };

  const handleAction = async (action) => {
    switch (action) {
      case "Get All Raw Call History": {
        const { filename } = await inquirer.prompt([
          {
            type: "input",
            name: "filename",
            message: "Enter output filename (or press enter for default):",
            default: "raw_call_history.json",
          },
        ]);
        await getAllRawCallHistory({ filename });
        break;
      }
      case "Get Extensive Call History": {
        const { filename } = await inquirer.prompt([
          {
            type: "input",
            name: "filename",
            message: "Enter output file name (or press enter for default):",
            default: "raw_extensive_call_data.json",
          },
        ]);
        await getAllExtensiveCallHistory({ filename });
        break;
      }
      case "Download Audio/Video Assets": {
        const { filename } = await inquirer.prompt([
          {
            type: "input",
            name: "filename",
            message:
              "Enter extensive call file name (or press enter for default):",
            default: "raw_extensive_call_data.json",
          },
        ]);
        await getAllCallAssets({ filename });
        break;
      }
      case "Exit":
        console.log(chalk.green("Goodbye!"));
        process.exit(0);
    }
  };

  const shouldContinue = async () => {
    const { continue: result } = await inquirer.prompt([
      {
        type: "confirm",
        name: "continue",
        message: "Would you like to perform another action?",
        default: true,
      },
    ]);
    return result;
  };

  try {
    const action = await getAction();
    await handleAction(action);

    if (await shouldContinue()) {
      await interactive();
    } else {
      console.log(chalk.green("Goodbye!"));
      process.exit(0);
    }
  } catch (error) {
    console.error(chalk.red("An error occurred:", error.message));
    process.exit(1);
  }
};
