import { Router } from "express";
import autenticacao from "../../../middlewares/autenticacao.js";
import {
  criarAvaliacao,
  editarAvaliacao,
  deletarAvaliacao,
} from "../controller/avaliacao.controller.js";

const router = Router();

//! POST /avaliacao/create
//! (🔒 Autenticado como CLIENTE) Cria uma avaliação para um serviço concluído.
//! Corpo: JSON com { registroId, nota, comentario }.
router.post("/create", autenticacao, criarAvaliacao);

//! PATCH /avaliacao/:id
//! (🔒 Autenticado como CLIENTE) Edita uma avaliação que o usuário fez.
//! Parâmetro de URL: :id da avaliação.
//! Corpo: JSON com { nota, comentario } (opcionais).
router.patch("/:id", autenticacao, editarAvaliacao);

//! DELETE /avaliacao/:id
//! (🔒 Autenticado como CLIENTE) Deleta uma avaliação que o usuário fez.
//! Parâmetro de URL: :id da avaliação.
router.delete("/:id", autenticacao, deletarAvaliacao);

export default router;
