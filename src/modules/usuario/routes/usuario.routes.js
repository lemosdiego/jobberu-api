import { Router } from "express";
import multer from "multer";
import multerConfig from "../../../lib/multer.js";
import {
  authenticateUser,
  criarUsuario,
  listarUsuarios,
  listaUsuarioId,
  editarUsuario,
  deletarUsuario,
  listarServicosDoPrestador,
  listarMinhasAvaliacoes,
} from "../../usuario/controller/usuario.controller.js";
import autenticacao from "../../../middlewares/autenticacao.js";

// 1. Cria uma instância do Multer, alimentando-o com nossa configuração.
const upload = multer(multerConfig);
const router = Router();

// 2. Aplica o middleware do Multer na rota de criação.
// - 'upload.single()' diz ao Multer para esperar um único arquivo.
// - "'foto_perfil'" é o nome do campo que o front-end deve usar para enviar o arquivo.

// Rota genérica para criar um usuário (CLIENTE ou PRESTADOR)
router.post("/create", upload.single("foto_perfil"), criarUsuario);

router.post("/login", authenticateUser);
router.get("/", listarUsuarios);
router.get("/:id", listaUsuarioId);

// Rota para o usuário logado ver as avaliações que ele fez
router.get("/me/avaliacoes", autenticacao, listarMinhasAvaliacoes);
router.get("/:id/servicos", listarServicosDoPrestador);
router.patch(
  "/atualizar/:id",
  autenticacao,
  upload.single("foto_perfil"),
  editarUsuario
);

router.delete("/excluir/:id", autenticacao, deletarUsuario);

export default router;
