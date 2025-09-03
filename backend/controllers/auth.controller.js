const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validation = require("../utils/validation");

// -------- REGISTER ----------
exports.register = async (req, res) => {
  try {
    if (!validation.isValidRequestBody(req.body)) {
      return res.status(400).send({ status: false, message: "Request body is required" });
    }

    const { name, email, password } = req.body;

    if (!validation.isValid(name)) {
      return res.status(400).send({ status: false, message: "Name is required" });
    }

    if (!validation.isValid(email) || !validation.isValidEmail(email)) {
      return res.status(400).send({ status: false, message: "Valid email is required" });
    }

    if (!validation.isValid(password) || password.trim().length < 6) {
      return res.status(400).send({ status: false, message: "Password must be at least 6 characters long" });
    }

    const existing = await User.findOne({ email: email.trim() });
    if (existing) {
      return res.status(409).send({ status: false, message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password.trim(), 10);

    const user = await User.create({
      name: name.trim(),
      email: email.trim(),
      passwordHash: hashed
    });

    return res.status(201).send({
      status: true,
      message: "User registered successfully",
      data: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// -------- LOGIN ----------
exports.login = async (req, res) => {
  try {
    if (!validation.isValidRequestBody(req.body)) {
      return res.status(400).send({ status: false, message: "Request body is required" });
    }

    const { email, password } = req.body;

    if (!validation.isValid(email) || !validation.isValidEmail(email)) {
      return res.status(400).send({ status: false, message: "Valid email is required" });
    }

    if (!validation.isValid(password)) {
      return res.status(400).send({ status: false, message: "Password is required" });
    }

    const user = await User.findOne({ email: email.trim() });
    if (!user) return res.status(401).send({ status: false, message: "Invalid credentials" });

    const match = await bcrypt.compare(password.trim(), user.passwordHash);
    if (!match) return res.status(401).send({ status: false, message: "Invalid credentials" });

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("accessToken", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000, sameSite: "lax" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: "lax" });

    return res.status(200).send({
      status: true,
      message: "Login successful",
      data: { id: user._id, name: user.name, email: user.email },
      token: accessToken
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// -------- REFRESH ----------
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) return res.status(401).send({ status: false, message: "Refresh token required" });

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).send({ status: false, message: "Invalid refresh token" });

      const newAccess = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: "15m" });

      res.cookie("accessToken", newAccess, { httpOnly: true, maxAge: 15 * 60 * 1000, sameSite: "lax" });

      return res.status(200).send({ status: true, message: "Token refreshed", token: newAccess });
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// -------- LOGOUT ----------
exports.logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).send({ status: true, message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
