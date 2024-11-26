import fs from "fs";
import axios from "axios";
import path from "path";
import chalk from "chalk";
import { tryCatch } from "./functional.js";

const getDirectoryPath = () => {
  return path.join(process.cwd(), "/output");
};
const getOutputPath = (filename) =>
  path.isAbsolute(filename)
    ? filename
    : path.join(getDirectoryPath(), filename);

export const loadCallHistory = async (filename) => {
  const filePath = getOutputPath(filename);
  const rawData = await fs.promises.readFile(filePath, "utf8");
  const parsedData = await JSON.parse(rawData);
  return [...parsedData];
};

export const saveToFile = tryCatch(
  async (filename, data) => {
    const directoryPath = getDirectoryPath();
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

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

export async function downloadFile(fileUrl) {
  const directoryPath = getDirectoryPath();

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  const outputLocationPath = getOutputPath("test.mp4");
  console.log("OUTPUTLOCATIONPATH: ", outputLocationPath);
  const writer = fs.createWriteStream(outputLocationPath);

  return axios({
    method: "get",
    url: fileUrl,
    responseType: "stream",
  }).then((response) => {
    //ensure that the user can call `then()` only when the file has
    //been downloaded entirely.

    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error = null;
      writer.on("error", (err) => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on("close", () => {
        if (!error) {
          resolve(true);
        }
        //no need to call the reject here, as it will have been called in the
        //'error' stream;
      });
    });
  });
}
