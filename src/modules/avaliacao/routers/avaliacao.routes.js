import { Router } from "express";
import autenticacao from "../../../middlewares/autenticacao.js";
import {
  criarAvaliacao,
  listarAvaliacoes,
  editarAvaliacao,
  deletarAvaliacao,
  verificarDisponibilidade,
} from "../controller/avaliacao.controller.js";

const router = Router();

//! POST /avaliacao/create
//! (🔒 Autenticado como CLIENTE) Cria uma avaliação para um serviço concluído.
//! Corpo: JSON com { registroId, nota, comentario }.
router.post("/create", autenticacao, criarAvaliacao);

//! GET /avaliacao/verificar
//! (🔒 Autenticado) Verifica se o usuário logado tem permissão (serviço concluído) para avaliar um prestador.
//! Query Param: ?prestadorId=123
router.get("/verificar", autenticacao, verificarDisponibilidade);

//! GET /avaliacao/me
//! (🔒 Autenticado como CLIENTE) Lista as avaliações feitas pelo usuário logado.
router.get("/me", autenticacao, listarAvaliacoes);

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
