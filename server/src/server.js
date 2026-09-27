const app = require("./app");
const connectDB = require("./app/config/db");

const PORT = process.env.PORT || 5001;

const main = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`NexaClan server is on port ${PORT}`));
};

main().catch((error) => {
  console.error("Unable to start NexaClan:", error.message);
  process.exit(1);
});
