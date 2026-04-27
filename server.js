import express from "express";
import userRoutes from "./routes/userRoutes.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()
const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);
 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));



app.listen(5000, () => console.log("Server Running"));