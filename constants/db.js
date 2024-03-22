const mongoConnectionString =
  process.env.NODE_ENV === "development"
    ? process.env.LOCAL_CONNECTION_STRING
    : process.env.CONNECTION_STRING;

module.exports = { mongoConnectionString };
