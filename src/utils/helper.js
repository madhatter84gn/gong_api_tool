import { saveToFile, getDirectoryPath, loadCallHistory } from "./file.js";
import path from "path";
import fs from "fs";

export const splitIntoBatches = async (arr) => {
  const batchSize = process.env.BATCH_SIZE;
  return Array.from({ length: Math.ceil(arr.length / batchSize) }, (_, i) =>
    arr.slice(i * batchSize, (i + 1) * batchSize),
  );
};

export const recordBatchResults = async (results) => {
  const dir = getDirectoryPath();
  const filepath = path.join(dir, "results.json");
  if (!fs.existsSync(filepath)) {
    await saveToFile(filepath, results);
  } else {
    const previousResults = await loadCallHistory(filepath);
    const allResults = [...previousResults, ...results];
    await saveToFile(filepath, allResults);
  }
};

export const removeAllreadyProcessedCalls = async (
  callList,
  processedCalls,
) => {
  const idsToRemove = new Set(processedCalls.map((item) => item.id));
  return callList.filter((item) => !idsToRemove.has(item.metaData.id));
};
