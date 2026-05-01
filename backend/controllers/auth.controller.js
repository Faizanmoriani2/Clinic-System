import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const signToken = (adminId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, "JWT_SECRET is not configured");
  }

  return jwt.sign({ adminId }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
};

export const registerAdmin = asyncHandler(async (req, res) => {
  const existingAdmin = await Admin.findOne({ username: req.body.username });
  if (existingAdmin) {
    throw new ApiError(409, "Admin username already exists");
  }

  const admin = await Admin.create(req.body);
  const token = signToken(admin._id);

  res.status(201).json({
    success: true,
    data: { id: admin._id, username: admin.username },
    token,
  });
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username }).select("+password");

  if (!admin || !(await admin.comparePassword(password))) {
    throw new ApiError(401, "Invalid username or password");
  }

  const token = signToken(admin._id);

  res.json({
    success: true,
    data: { id: admin._id, username: admin.username },
    token,
  });
});
