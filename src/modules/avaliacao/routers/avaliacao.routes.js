import { Router } from "express";
import autenticacao from "../../../middlewares/autenticacao.js";
import {
  criarAvaliacao,
  editarAvaliacao,
  deletarAvaliacao,
} from "../controller/avaliacao.controller.js";

const router = Router();

// Rota para um cliente criar uma avaliação para um prestador
router.post("/create/:prestadorId", autenticacao, criarAvaliacao);

// Rota para um cliente editar sua própria avaliação
router.patch("/:id", autenticacao, editarAvaliacao);

// Rota para um cliente deletar sua própria avaliação
router.delete("/:id", autenticacao, deletarAvaliacao);

export default router;
