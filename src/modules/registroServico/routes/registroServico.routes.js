import { Router } from "express";

import { solicitarConfirmacao } from "../controller/registroServico.controller.js";
import autenticacao from "../../../middlewares/autenticacao.js";

const registroServicoRoutes = Router();

// Rota para o PRESTADOR solicitar a confirmação de um serviço
// POST /registro-servico/solicitar
registroServicoRoutes.post(
  "/solicitar",
  autenticacao, // Garante que apenas usuários logados (e prestadores) podem acessar
  solicitarConfirmacao
);

export default registroServicoRoutes;
