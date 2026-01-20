import express, { Application, Request, Response, NextFunction } from "express";
import "dotenv/config";
import cors from "cors";
import fileUpload from "express-fileupload";

import connectDB from "./config/database.config";
import routes from "./Routes/Routes";
import { connectCloudinary } from "./config/cloud.config";

const app: Application = express();

// Connect services
connectDB();
connectCloudinary();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

// Security headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
  next();
});

// Routes
app.use("/", routes);

const PORT: number = Number(process.env.PORT) || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// import express from "express";
// import "dotenv/config";
// import connectDB from "./config/database.js";
// import routes from "../../Routes/Routes.js";
// import cors from "cors";
// import { connectCloudinary } from "./config/cloud.js";
// import fileUpload from "express-fileupload";

// const app = express();

// connectDB();

// connectCloudinary();

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/tmp/"
//   })
// ); //* special middleware to upload files
// app.use(cors({ origin: "http://localhost:5173" }));
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type"],
//     credentials: true // Allow cookies
//   })
// );
// app.use((req, res, next) => {
//   res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
//   res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
//   next();
// });

// app.use("/", routes);

// const PORT = process.env.PORT || 8080;
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running on port ${PORT}`);
// });
