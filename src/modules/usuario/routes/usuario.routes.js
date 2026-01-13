import { Router } from "express";
import multer from "multer";
import multerConfig from "../../../lib/multer.js";
import {
  createUser,
  listUsers,
  listUsersId,
  listProviderServices,
  listMyReviews,
  editUser,
  deleteUser,
  listProvidersByCity,
} from "../../usuario/controller/usuario.controller.js";
import autenticacao from "../../../middlewares/autenticacao.js";
import { validate } from "../../../middlewares/validateRequest.js";
import { criarUsuarioSchema } from "../schemas/usuario.schema.js";

// 1. Cria uma instância do Multer, alimentando-o com nossa configuração.
const upload = multer(multerConfig);
const router = Router();
// 2. Aplica o middleware do Multer na rota de criação.
// - 'upload.single()' diz ao Multer para esperar um único arquivo.
// - "'foto_perfil'" é o nome do campo que o front-end deve usar para enviar o arquivo.

//======Endpoints de Usuário======//
//! POST /usuario/create
//! Cria um novo usuário (cliente ou prestador).
//! Corpo: multipart/form-data com os campos do usuário.
router.post(
  "/create",
  upload.single("foto_perfil"),
  validate(criarUsuarioSchema),
  createUser
);

//! GET /usuario
//! Lista todos os usuários.
router.get("/", listUsers);
//! GET /usuario/:id
//! Busca um prestador específico pelo ID.
router.get("/:id", listUsersId);
//! GET /usuario/:id/servicos
//! Lista os serviços de um prestador específico.
router.get("/:id/servicos", listProviderServices);
//! GET /usuario/me/avaliacoes
//! (🔒 Autenticado) Lista as avaliações feitas pelo usuário logado.
router.get("/me/avaliacoes", autenticacao, listMyReviews);
//! PATCH /usuario/atualizar/:id
//! (🔒 Autenticado) Atualiza o perfil do próprio usuário.
//! Corpo: multipart/form-data com os campos a serem atualizados.
router.patch(
  "/atualizar/:id",
  autenticacao,
  upload.single("foto_perfil"),
  editUser
);
//! DELETE /usuario/excluir/:id
//! (🔒 Autenticado) Deleta o perfil do próprio usuário.
router.delete("/excluir/:id", autenticacao, deleteUser);
//! GET /usuario/prestadores/:cidade
//! Lista todos os prestadores de uma cidade específica.
//! Parâmetro: :cidade (nome da cidade).
router.get("/prestadores/cidade/:cidade", listProvidersByCity);

export default router;
