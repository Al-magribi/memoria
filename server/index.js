import "dotenv/config";
import app from "./app.js";
import { dbClient } from "./config/cofing.js";

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(process.env.PORT, async () => {
  console.log(`Server is running on port ${process.env.PORT}`);

  // Ensure MongoDB connection is established
  try {
    await dbClient;
    console.log("MongoDB connection ready");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
});
