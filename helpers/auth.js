const getToken = async () => {
  const token = Buffer.from(
    `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`,
    "utf8",
  ).toString("base64");
  return token;
};

export { getToken };
