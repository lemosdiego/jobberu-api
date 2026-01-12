import prisma from "../../../lib/prisma.js";
import { StatusServico } from "@prisma/client";

export default async function SolicitarConfirmacaoService(
  prestadorId,
  clienteId
) {
  // O cliente foi fornecido?
  if (!clienteId) {
    throw new Error("O ID do cliente é obrigatório.");
  }

  // O prestador não pode solicitar a si próprio
  if (prestadorId === clienteId) {
    throw new Error("Você não pode solicitar confirmação para si mesmo.");
  }

  // Verifica se o cliente existe
  const cliente = await prisma.usuario.findUnique({
    where: { id: clienteId },
  });
  if (!cliente) {
    throw new Error("Cliente não encontrado.");
  }

  // Verifica se já existe uma solicitação pendente (duplicidade)
  const registroExistente = await prisma.registroServico.findFirst({
    where: {
      prestadorId,
      clienteId,
      status: StatusServico.PENDENTE_CONFIRMACAO_CLIENTE,
    },
  });
  if (registroExistente) {
    throw new Error("Já existe uma solicitação pendente para este cliente.");
  }

  // Passando por todas as etapas, cria o registro
  return await prisma.registroServico.create({
    data: {
      prestadorId,
      clienteId,
      status: StatusServico.PENDENTE_CONFIRMACAO_CLIENTE,
    },
  });
}
