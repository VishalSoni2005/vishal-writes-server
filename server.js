import express from "express";
import "dotenv/config";
import connectDB from "./config/database.js";
import routes from "./Routes/Routes.js";
import cors from "cors";
import { connectCloudinary } from "./config/cloud.js";
import fileUpload from "express-fileupload";

const app = express();

connectDB();

connectCloudinary();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
  })
); //* special middleware to upload files
// app.use(cors({ origin: true, credentials: true })); // Enable CORS for all origins with credentials
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true // Allow cookies
  })
);
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
  next();
});

// routes
app.use("/", routes);

const PORT = process.env.port || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
