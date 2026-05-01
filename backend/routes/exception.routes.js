import express from "express";
import {
  createException,
  deleteException,
  getExceptions,
} from "../controllers/exception.controller.js";

const router = express.Router();

router.route("/").get(getExceptions).post(createException);
router.route("/:id").delete(deleteException);

export default router;
