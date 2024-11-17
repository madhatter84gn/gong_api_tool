import axios from "axios";
import { getToken } from "./auth.js";

const getCallHistory = async () => {
  const config = {
    headers: {
      Authorization: `Basic ${await getToken()}`,
    },
  };

  const url = `${process.env.BASE_URL}/calls`;
  const results = [];
  let cursor = null;
  do {
    // Add the cursor to the parameters if it exists
    const queryParams = {};
    if (cursor) {
      queryParams.cursor = cursor;
    }
    try {
      // Make the API call
      const response = await axios.get(url, {
        headers: config.headers,
        params: {
          cursor: queryParams.cursor,
        },
      });

      // Process the response data
      const data = response.data;
      results.push(...(data.calls || []));
      // Check for the next cursor
      cursor = data.records.cursor || null;
    } catch (error) {
      console.error("Error during API call:", error.message);
      break; // Exit loop on error
    }
  } while (cursor);

  return results;
};

export { getCallHistory };
