import path from "path";
import { createMediaPath, getDirectoryPath } from "../utils/file.js";
import { downloadAsset } from "../api/client.js";
export const processCallRecord = async (record) => {
  const { metaData, media } = { ...record };
  const { title, scheduled, id, audioUrl, videoUrl } = {
    ...metaData,
    ...media,
  };

  const fullPathToMedia = path.join(
    getDirectoryPath(),
    await validateCreateMediaPath({
      title,
      scheduled,
    }),
  );

  const results = await downloadMediaAssets({
    fullPathToMedia,
    title,
    audioUrl,
    videoUrl,
  });

  const callRecordResult = { id, results: Object.assign({}, ...results) };
  return callRecordResult;
};

const validateCreateMediaPath = async ({ title, scheduled: schedule }) => {
  const dateDetail = parseTimestamp(schedule);
  return await createMediaPath(title, dateDetail);
};

const downloadMediaAssets = async ({ audioUrl, videoUrl, fullPathToMedia }) => {
  const results = [];
  try {
    if (audioUrl) {
      const filename = `${fullPathToMedia}/audio.mp3`;
      await downloadAsset(audioUrl, filename);
      results.push({ audioUrl, success: true });
    }
  } catch (error) {
    results.push({ audioUrl, success: false });
  }

  try {
    if (videoUrl) {
      const filename = `${fullPathToMedia}/video.mp4`;
      await downloadAsset(videoUrl, filename);
      results.push({ videoUrl, success: true });
    }
  } catch (error) {
    results.push({ videoUrl, success: false });
  }

  return results;
};

const parseTimestamp = (timestamp) => {
  const date = new Date(timestamp);

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
};
