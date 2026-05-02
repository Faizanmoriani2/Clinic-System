import express from "express";
import {
  createException,
  deleteException,
  getExceptions,
} from "../controllers/exception.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(protect, getExceptions).post(protect, createException);
router.route("/:id").delete(protect, deleteException);

export default router;
