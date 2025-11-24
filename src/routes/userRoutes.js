import { Router } from "express";
import { createUser, getUser } from "../controller/userController.js";

const router = Router();
router.post("/create", createUser);
router.get("/", getUser);

export default router;
