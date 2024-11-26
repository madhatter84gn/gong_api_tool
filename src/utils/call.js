import path from "path";
import { createMediaPath, getDirectoryPath } from "../utils/file.js";
import { downloadAsset } from "../api/client.js";
export const processCallRecord = async (record) => {
  const { metaData, media } = { ...record };
  const { title, scheduled, meetingUrl, audioUrl, videoUrl } = {
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

  await downloadMediaAssets({ fullPathToMedia, title, audioUrl, videoUrl });
  return;
};

const validateCreateMediaPath = async ({ title, scheduled: schedule }) => {
  const dateDetail = parseTimestamp(schedule);
  return await createMediaPath(title, dateDetail);
};

const downloadMediaAssets = async ({ audioUrl, videoUrl, fullPathToMedia }) => {
  try {
    if (audioUrl) {
      const filename = `${fullPathToMedia}/audio.mp3`;
      await downloadAsset(audioUrl, filename);
    }

    if (videoUrl) {
      const filename = `${fullPathToMedia}/video.mp4`;
      await downloadAsset(videoUrl, filename);
    }
  } catch (error) {
    console.error(error);
  }

  // TODO: Need to pass back both urls and success/failure of download
  return;
};

const parseTimestamp = (timestamp) => {
  const date = new Date(timestamp);

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
};

const createDownloadLocation = (dateDetail) => {
  const outputPath = getDirectoryPath;
  console.log(outputPath);
};
