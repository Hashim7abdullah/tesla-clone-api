import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userModel from "../model/UserModel.js";
import validator from "validator";

//registration

const registerUser = async (req, res) => {
  try {
    const { name, email, number, password } = req.body;
    const user = await userModel.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exist",
      });
    }

    //validate the email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Email is not valid",
      });
    }

    //password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be more than 8 characters",
      });
    }

    if (password.length > 15) {
        return res.status(400).json({
            success:false,
            message:"Password must be less than 15 characters"
        })
    }

    


  } catch (error) {}
};
