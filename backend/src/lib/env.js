import "dotenv/config";

export const ENV = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  USER_DB: process.env.USER_DB,
  JWT_SECRET: process.env.JWT_SECRET,
};