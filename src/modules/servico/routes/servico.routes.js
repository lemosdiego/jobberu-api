import { Router } from "express";
import multer from "multer";
import multerConfig from "../../../lib/multer.js";
import {
  criarServico,
  listarServicos,
  editarServico,
  listarServicoId,
  deletarServico,
} from "../controller/servico.controller.js";
import autenticacao from "../../../middlewares/autenticacao.js";

const upload = multer(multerConfig);
const router = Router();

router.post(
  "/create",
  autenticacao,
  upload.array("imagens_servico", 5),
  criarServico
);
router.get("/", listarServicos);
router.get("/:id", listarServicoId); // Rota para buscar um serviço específico
router.patch(
  "/atualizar/:id",
  autenticacao,
  upload.array("imagens", 5), // <-- ADICIONE O MIDDLEWARE MULTER AQUI
  editarServico
);
router.delete(
  "/excluir/:id",
  autenticacao,
  // upload.array("imagens_servico", 5), // Remova esta linha
  deletarServico
);

export default router;
