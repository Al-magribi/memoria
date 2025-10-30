import "dotenv/config";
import app from "./app.js";
import { dbConnect } from "./config/config.js";
import { createServer } from "http";

const server = createServer(app);

app.get("/", (req, res) => {
  res.send("Server is Ok");
});

server.listen(process.env.PORT, async () => {
  try {
    console.log(`Server is running on port ${process.env.PORT}`);

    await dbConnect;
  } catch (error) {
    console.log(`connetion is error : ${error}`);
  }
});
