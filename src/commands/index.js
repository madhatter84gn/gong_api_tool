import ora from "ora";
import chalk from "chalk";
import inquirer from "inquirer";
import { getAllCalls, getCallDetails } from "../api/client.js";
import { pipe, tryCatch } from "../utils/functional.js";

const withSpinner = (message) => async (fn) => {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.succeed("Operation completed successfully");
    return result;
  } catch (error) {
    spinner.fail("Operation failed");
    throw error;
  }
};

export const getAllCallHistory = async ({ filename }) => {
  const processCallHistory = pipe(getAllCalls, (data) =>
    saveToFile(filename, data),
  );

  const handleError = (error) => {
    console.error(chalk.red(error.message));
    process.exit(1);
  };
  await tryCatch(
    withSpinner("Fetching call history...")(processCallHistory),
    handleError,
  )();
};

export const getDetailedCallHistory = async ({ id }) => {
  const processCallDetails = pipe(
    () => getCallDetails(id),
    (details) => {
      console.log(
        chalk.cyan("Call Details:"),
        JSON.stringify(details, null, 2),
      );
      return details;
    },
  );

  const handleError = (error) => {
    console.error(chalk.red(error.message));
    process.exit(1);
  };

  await tryCatch(
    withSpinner("Fetching call details...")(processCallDetails),
    handleError,
  )();
};

export const interactive = async () => {
  console.log(chalk.blue("Welcome to Call History CLI"));

  const getAction = async () => {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: ["Get All Call History", "Get Detailed Call History", "Exit"],
      },
    ]);
    return action;
  };

  const handleAction = async (action) => {
    switch (action) {
      case "Get All Call History": {
        const { filename } = await inquirer.prompt([
          {
            type: "input",
            name: "filename",
            message: "Enter output filename (or press enter for default):",
            default: "call_history.json",
          },
        ]);
        await getAllCallHistory({ filename });
        break;
      }
      case "Get Detailed Call History": {
        const { callId } = await inquirer.prompt([
          {
            type: "input",
            name: "callId",
            message: "Enter call ID (or press enter for all details):",
            default: null,
          },
        ]);
        await getDetailedCallHistory({ id: callId || null });
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
