import api from "@modules/images/controller";
import express from "express";
import { imageUploadMiddleware } from "@middlewares/index";
const router = express.Router();

router.post("/", imageUploadMiddleware, api.uploadImage);

module.exports = router;
