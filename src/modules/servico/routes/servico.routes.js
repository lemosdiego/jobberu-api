import { Router } from "express";
import multer from "multer";
import multerConfig from "../../../lib/multer.js";
import {
  createService,
  listService,
  listServiceId,
  editService,
  deleteService,
} from "../controller/servico.controller.js";
import autenticacao from "../../../middlewares/autenticacao.js";

const upload = multer(multerConfig);
const router = Router();

router.post(
  "/create",
  autenticacao,
  upload.array("imagens_servico", 5),
  createService
);
router.get("/", listService);
router.get("/:id", listServiceId); // Rota para buscar um serviço específico
router.patch(
  "/atualizar/:id",
  autenticacao,
  upload.array("imagens", 5), // <-- ADICIONE O MIDDLEWARE MULTER AQUI
  editService
);
router.delete(
  "/excluir/:id",
  autenticacao,
  // upload.array("imagens_servico", 5), // Remova esta linha
  deleteService
);

export default router;
