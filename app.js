import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Dbconnection from "./config/config.js";
import cookieParser from "cookie-parser";
import userRouter from "./router/userRouter.js";

dotenv.config();

//app setting

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
Dbconnection()


app.use("/api/user" , userRouter)

app.listen(process.env.PORT || 5000, () => {
  console.log(`Serveris runnning at ${process.env.PORT}`);
});
