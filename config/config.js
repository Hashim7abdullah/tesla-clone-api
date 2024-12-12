import mongoose from "mongoose";

const Dbconnection = async () => {
  mongoose.connection.on("connected", () => {
    console.log("DataBase Succesfully connected");
  });
  await mongoose.connect(`${process.env.MONGODB_URI}tesla`);
};

export default Dbconnection;
