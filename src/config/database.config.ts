import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async (): Promise<void> => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      throw new Error("MONGO_URI not defined");
    }

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", (error as Error).message);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;

// import mongoose from "mongoose";
// import "dotenv/config";

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true, // Crucial for parsing the connection string
//       useUnifiedTopology: true, // Uses the new connection management engine
//       serverSelectionTimeoutMS: 10000 // Fails fast after 10 seconds
//     });
//     console.log("✅ Database Connected Successfully");
//   } catch (error) {
//     console.error("❌ Database Connection Fail:", error.message);

//     setTimeout(connectDB, 5000);
//   }
// };

// export default connectDB;
