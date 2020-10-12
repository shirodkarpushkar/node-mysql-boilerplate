import api from "@modules/categories/controller";
import express from "express";
import { auth } from "@middlewares/index";

const router = express.Router();

router.get("/", auth.validateToken, api.getAllCategories);
router.get("/:id", auth.validateToken, api.getCategoryById);

module.exports = router;
