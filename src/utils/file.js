import fs from "fs";
import path from "path";
import chalk from "chalk";
import { tryCatch } from "./functional.js";

const getOutputPath = (filename) =>
  path.isAbsolute(filename)
    ? filename
    : path.join(path.join(process.cwd(), "/output"), filename);

const writeFile = async (filename, data) =>
  fs.writeFile(getOutputPath(filename), JSON.stringify(data, null, 2));

export const saveToFile = tryCatch(
  async (filename, data) => {
    const outputPath = getOutputPath(filename);
    //TODO: Check/Create directory path
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log();
    console.log(
      chalk.green(`✔ Data successfully saved to ${getOutputPath(filename)}`),
    );
    return data;
  },
  (error) => {
    console.log();
    console.error(chalk.red(`Error saving file: ${error.message}`));
    throw error;
  },
);

export const progressReport = async ({
  totalRecords,
  currentPageSize,
  currentPageNumber,
}) => {
  console.info();
  console.info("Total Records: ", totalRecords);
  console.info("Current Page Size: ", currentPageSize);
  console.info("Current Page Number: ", currentPageNumber);
};
