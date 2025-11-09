import "dotenv/config";
import "dotenv/config";
import server from "./app.js";
import { dbConnect } from "./config/config.js";

server.listen(process.env.PORT, async () => {
  try {
    console.log(`Server is running on port ${process.env.PORT}`);

    await dbConnect;
  } catch (error) {
    console.log(`connetion is error : ${error}`);
  }
});
