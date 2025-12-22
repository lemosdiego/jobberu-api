import { Router } from "express";
import {
  buscarClientePorCelular,
  solicitarConfirmacao,
  responderSolicitacao,
} from "../controller/registroServico.controller.js";
import autenticacao from "../../../middlewares/autenticacao.js";

const registroServicoRoutes = Router();

//! GET /registro-servico/buscar-cliente?celular=<numero>
//! (🔒 Autenticado) Permite que um prestador busque um cliente pelo número de celular.
//! Retorna dados básicos do cliente (id, nome, foto) para confirmação visual.
registroServicoRoutes.get(
  "/buscar-cliente",
  autenticacao,
  buscarClientePorCelular
);

//! POST /registro-servico/solicitar
//! (🔒 Autenticado como PRESTADOR) Solicita a confirmação de um serviço a um cliente.
//! Corpo: JSON com { "clienteId": <ID do cliente> }.
registroServicoRoutes.post(
  "/solicitar",
  autenticacao, // Garante que apenas usuários logados (e prestadores) podem acessar
  solicitarConfirmacao
);

//! PATCH /registro-servico/:id/responder
//! (🔒 Autenticado como CLIENTE) Responde a uma solicitação de serviço.
//! Parâmetro de URL: :id do registro de serviço.
//! Corpo: JSON com { "resposta": "CONCLUIDO" | "RECUSADO" }.
registroServicoRoutes.patch(
  "/:id/responder",
  autenticacao, // Garante que o cliente está logado
  responderSolicitacao
);

export default registroServicoRoutes;
