import axios from "axios";
import chalk from "chalk";
import { pipe } from "../utils/functional.js";

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
        config.params = {
          cursor: cursor,
        };
      }

      const response = await axios(config);
      const data = await response.data;
      results.push(...(data.calls || []));
      cursor = data.records.cursor || null;
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
export const getCallDetails = async (callId = null) => {
  const config = {
    ...createApiConfig(),
    method: "GET",
  };
  const apiCall = createApiCall(config);
  const endpoint = callId ? `/calls/${callId}` : "/calls/details";
  return apiCall(endpoint);
};
