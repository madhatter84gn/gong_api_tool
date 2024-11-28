import fs from "fs";
import path from "path";
import chalk from "chalk";
import { tryCatch } from "./functional.js";

export const getDirectoryPath = () => {
  return path.join(process.cwd(), "/output");
};

export const getOutputPath = (filename) =>
  path.isAbsolute(filename)
    ? filename
    : path.join(getDirectoryPath(), filename);

export const loadCallHistory = async (filename) => {
  const filePath = getOutputPath(filename);
  const rawData = await fs.promises.readFile(filePath, "utf8");
  const parsedData = await JSON.parse(rawData);
  return [...parsedData];
};

export const existsOrCreateDirectory = async (filePath) => {
  let directoryPath = getDirectoryPath();
  if (filePath) {
    directoryPath += filePath;
  }

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
};

const sanitizeTitle = (title) => {
  const sanitized = title
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/[\s]+/g, "_")
    .replace(/^\.+/, "")
    .trim()
    .substring(0, 255);

  return sanitized || "unnamed";
};

export const createMediaPath = async (title, date) => {
  let completePath = `/media/`;
  Object.keys(date).forEach((key) => {
    if (key === "year") {
      completePath += path.join(`${date[key].toString()}/`);
    } else {
      completePath += path.join(`${date[key].toString().padStart(2, 0)}/`);
    }
  });

  completePath += `${sanitizeTitle(title)}`;
  try {
    await existsOrCreateDirectory(completePath);
  } catch (error) {
    console.error(error);
  }

  return completePath;
};

export const saveToFile = tryCatch(
  async (filename, data) => {
    existsOrCreateDirectory();

    const filePath = getOutputPath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
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
