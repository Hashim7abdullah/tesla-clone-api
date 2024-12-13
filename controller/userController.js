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
        success: false,
        message: "Password must be less than 15 characters",
      });
    }

    //hash password
    const salt = await bcrypt.genSalt(12);
    const hashPassword = await bcrypt.hash(password, salt);

    //new user
    const newUser = new userModel({
      name,
      email,
      password: hashPassword,
      number
    });

    //save user
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

//login

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not registered",
      });
    }

    //password checking
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Password Incorrect",
      });
    }

    //token assigning
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    // console.log(token);
    
    res.cookie("token", token, { httpOnly: true, maxAge: 360000 });
    return res.status(201).json({
      success: true,
      message: "User Logged In Successfully ",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export { loginUser , registerUser}
