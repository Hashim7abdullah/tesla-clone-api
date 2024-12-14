import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import UserModel from "../model/UserModel.js";

// Token Management Utilities
const TokenService = {
  validatePassword: (password) => {
    const complexityChecks = [
      {
        regex: /^.{8,15}$/,
        error: "Password must be between 8-15 characters",
      },
      {
        regex: /(?=.*[A-Z])/,
        error: "Password must contain at least one uppercase letter",
      },
      {
        regex: /(?=.*[a-z])/,
        error: "Password must contain at least one lowercase letter",
      },
      {
        regex: /(?=.*\d)/,
        error: "Password must contain at least one number",
      },
      {
        regex: /(?=.*[!@#$%^&*(),.?":{}|<>])/,
        error: "Password must contain at least one special character",
      },
    ];

    for (const check of complexityChecks) {
      if (!check.regex.test(password)) {
        throw new Error(check.error);
      }
    }
  },

  generateTokens: (user) => {
    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        type: "access",
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
        algorithm: "HS256",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user._id,
        type: "refresh",
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );

    return { accessToken, refreshToken };
  },

  verifyToken: (token, isRefresh = false) => {
    try {
      const secret = isRefresh
        ? process.env.REFRESH_TOKEN_SECRET
        : process.env.ACCESS_TOKEN_SECRET;

      const decoded = jwt.verify(token, secret, {
        algorithms: ["HS256"],
      });

      if (isRefresh && decoded.type !== "refresh") {
        throw new Error("Invalid refresh token");
      }
      if (!isRefresh && decoded.type !== "access") {
        throw new Error("Invalid access token");
      }

      return decoded;
    } catch (error) {
      console.error("Token verification failed:", error.message);
      throw error;
    }
  },
};

// Define Controller Functions
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    try {
      TokenService.validatePassword(password);
    } catch (validationError) {
      return res.status(400).json({ success: false, message: validationError.message });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({ name, email, password: hashedPassword });

    const { accessToken, refreshToken } = TokenService.generateTokens(newUser);

    newUser.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = TokenService.generateTokens(user);

    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};

const refreshAccessToken = async (req, res) => {
  // Refresh token logic
};

const logout = async (req, res) => {
  // Logout logic
};

// Export the Functions
export { register, login, refreshAccessToken, logout };
