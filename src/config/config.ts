import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT,
  databaseUrl: process.env.MONGO_CONNECTION_STRING,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
};

//Object.freeze() - Prevents the modification of existing property attributes and values, and prevents the addition of new properties.
export const config = Object.freeze(_config);
