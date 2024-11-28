import axios from "axios";
import chalk from "chalk";
import https from "https";
import http from "http";
import { extensivePostBody } from "../utils/gong.js";
import { progressReport } from "../utils/file.js";
import { promisify } from "util";
import { pipeline } from "stream";
import fs from "fs";

const createApiConfig = () => ({
  baseURL: process.env.BASE_URL || "https://api.example.com",
  headers: {
    Authorization: `Basic ${getAuthToken()}`,
    "Content-Type": "application/json",
  },
});

const getAuthToken = () => {
  return Buffer.from(
    `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`,
  ).toString("base64");
};

const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    const errorMessages = {
      401: "Authentication failed. Please check your credentials.",
      403: "Access forbidden. Please check your permissions.",
      429: "Rate limit exceeded. Please try again later.",
    };

    const message =
      errorMessages[status] ||
      `API Error: ${data.message || "Unknown error occurred"}`;
    console.error(chalk.red(message));
  } else if (error.request) {
    console.error(
      chalk.red(
        "No response received from the server. Please check your connection.",
      ),
    );
  } else {
    console.error(chalk.red("Error setting up the request:", error.message));
  }
  throw error;
};

const createApiCall = (config) => async (endpoint) => {
  try {
    if (endpoint) {
      config.baseURL += endpoint;
    }

    const results = [];
    let cursor = null;

    do {
      if (cursor) {
        if (config.method === "GET") {
          config.params = {
            cursor: cursor,
          };
        }

        if (config.method === "POST") {
          config.data.cursor = cursor;
        }
      }

      const response = await axios(config);
      const data = await response.data;
      results.push(...(data.calls || []));
      cursor = data.records.cursor || null;
      progressReport(data.records);
    } while (cursor);

    return results;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAllCalls = async () => {
  const config = {
    ...createApiConfig(),
    method: "GET",
  };
  const apiCall = createApiCall(config);
  return apiCall("/calls");
};

export const getCallDetails = async () => {
  const config = {
    ...createApiConfig(),
    method: "POST",
  };
  config.data = extensivePostBody;
  const apiCall = createApiCall(config);
  const endpoint = "/calls/extensive";
  return apiCall(endpoint);
};

export async function downloadAsset(fileUrl, outputPath, options = {}) {
  const { timeout = 60000, onProgress = () => {} } = options;
  // Promisify the pipeline method
  const asyncPipeline = promisify(pipeline);

  return new Promise((resolve, reject) => {
    // Determine which protocol to use
    const protocol = fileUrl.startsWith("https") ? https : http;

    // Create write stream
    const writeStream = fs.createWriteStream(outputPath.toString());

    // Make the request
    const request = protocol.get(fileUrl, (response) => {
      // Check for successful response
      if (response.statusCode !== 200) {
        writeStream.close();
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }

      // Get total file size for progress tracking
      const totalSize = parseInt(response.headers["content-length"], 10);
      let downloadedSize = 0;

      // Track download progress
      response.on("data", (chunk) => {
        downloadedSize += chunk.length;

        // Call progress callback if provided
        if (totalSize) {
          const progress = (downloadedSize / totalSize) * 100;
          onProgress({
            total: totalSize,
            downloaded: downloadedSize,
            percent: progress.toFixed(2),
          });
        }
      });

      // Pipe response to file stream
      asyncPipeline(response, writeStream)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          writeStream.close();
          reject(err);
        });
    });

    // Handle request errors
    request.on("error", (err) => {
      writeStream.close();
      reject(err);
    });
  });
}
