import { Router } from "express";
import {
  createUser,
  getUser,
  authenticateUser,
} from "../../usuario/controller/user.controller.js";

const router = Router();
router.post("/create", createUser);
router.get("/", getUser);
router.post("/login", authenticateUser);

export default router;
