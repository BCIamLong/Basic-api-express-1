const dotenv = require("dotenv");
const mogoose = require("mongoose");
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
app.listen(port, () => {
  console.log(`Server listening with port ${port}`);
});
