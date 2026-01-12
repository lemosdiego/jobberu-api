import prisma from "../../../lib/prisma.js";
import { StatusServico } from "@prisma/client";

export default async function ResponderSolicitacaoService(
  registroId,
  clienteIdLogado,
  resposta
) {
  // REGRA 2.1: A resposta é válida?
  if (!["CONCLUIDO", "RECUSADO"].includes(resposta)) {
    throw new Error("A resposta deve ser 'CONCLUIDO' ou 'RECUSADO'.");
  }

  const statusResposta =
    resposta === "CONCLUIDO" ? StatusServico.CONCLUIDO : StatusServico.RECUSADO;

  // REGRA 2.2: Busca o registro no banco
  const registro = await prisma.registroServico.findUnique({
    where: { id: registroId },
  });

  if (!registro) {
    throw new Error("Solicitação de serviço não encontrada.");
  }

  // REGRA 2.3: O usuário logado é o cliente correto para esta solicitação?
  if (registro.clienteId !== clienteIdLogado) {
    throw new Error(
      "Você não tem permissão para responder a esta solicitação."
    );
  }

  // REGRA 2.4: A solicitação ainda está pendente?
  if (registro.status !== StatusServico.PENDENTE_CONFIRMACAO_CLIENTE) {
    throw new Error(
      `Esta solicitação já foi respondida com o status: ${registro.status}.`
    );
  }

  // 3. ATUALIZAÇÃO DO REGISTRO
  return await prisma.registroServico.update({
    where: { id: registroId },
    data: {
      status: statusResposta, // Atualiza o status com a resposta do cliente
    },
  });
}
