import chalk from "chalk";

export const validateEnvVariables = () => {
  const required = ["CLIENT_ID", "CLIENT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    console.error(
      chalk.red("Missing required environment variables:", missing.join(", ")),
    );
    console.error(
      chalk.yellow("Please create a .env file with the required variables."),
    );
    process.exit(1);
  }
};
