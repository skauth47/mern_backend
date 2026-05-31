import cors from "cors";
import dns from "node:dns";
import express from "express";
import userRoutes from "./routes/userRoutes.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/api/users", userRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server Running on Port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });
