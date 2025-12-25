import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, // Crucial for parsing the connection string
      useUnifiedTopology: true, // Uses the new connection management engine
      serverSelectionTimeoutMS: 10000 // Fails fast after 10 seconds
    });
    console.log("✅ Database Connected Successfully");
  } catch (error) {
    console.error("❌ Database Connection Failed:", error.message);
    // Optional: Retry Connection After Delay
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
