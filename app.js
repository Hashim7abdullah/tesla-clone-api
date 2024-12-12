import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Dbconnection from "./config/config.js";

dotenv.config();

//app setting

const app = express();
app.use(cors());
app.use(express.json());
Dbconnection()

app.listen(process.env.PORT || 5000, () => {
  console.log(`Serveris runnning at ${process.env.PORT}`);
});