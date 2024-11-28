export const splitIntoBatches = async (arr) => {
  const batchSize = process.env.BATCH_SIZE;
  return Array.from({ length: Math.ceil(arr.length / batchSize) }, (_, i) =>
    arr.slice(i * batchSize, (i + 1) * batchSize),
  );
};
