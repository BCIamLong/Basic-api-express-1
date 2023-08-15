const dotenv = require("dotenv");
const mogoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log("Apllication shutting dow");
  console.log(`${err.name}" ${err.message}`);
  process.exit(1);
});

const app = require("./app");

dotenv.config({ path: "./config.env" });

// const DB_CLOUD = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);
const DB_LOCAL = process.env.DATABASE_LOCAL;
(async () => {
  try {
    await mogoose.connect(DB_LOCAL);
    console.log("Connect DB success");
  } catch (err) {
    console.log(err);
  }
})();

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`Server listening with port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("Aplication shutting dow");
  console.log(`${err.name}" ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
