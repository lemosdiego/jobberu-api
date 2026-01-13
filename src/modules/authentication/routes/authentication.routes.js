import { Router } from "express";
import { authenticateUser } from "../controller/authentication.controller.js";

const router = Router();

//! POST /usuario/login
//! Autentica um usuário e retorna um token.
//! Corpo: JSON com { email, senha }.
router.post("/login", authenticateUser);

export default router;
