import mongoose from "mongoose";

const uri = process.env.MONGOURI;

// Function to get current time in Indonesian WIB format
function getCurrentTimeWIB() {
  const now = new Date();
  const options = {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return now.toLocaleString("id-ID", options);
}

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(uri);
    console.log(`Connected: ${getCurrentTimeWIB()}`);
    return mongoose.connection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

// Initialize connection
const dbClient = connectToMongoDB();

export { mongoose, dbClient };
