import express from "express";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use("/api/users", userRoutes);

app.listen(5000, () => console.log("Running"));