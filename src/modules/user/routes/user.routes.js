import { Router } from "express";
import { createUser, getUser } from "../../user/controller/user.controller.js";

const router = Router();
router.post("/create", createUser);
router.get("/", getUser);

export default router;
