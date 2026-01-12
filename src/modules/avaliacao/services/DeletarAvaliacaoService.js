import prisma from "../../../lib/prisma.js";

export default async function DeletarAvaliacaoService(avaliacaoId, clienteId) {
  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id: avaliacaoId },
  });

  if (!avaliacao) {
    throw new Error("Avaliação não encontrada.");
  }

  if (avaliacao.clienteId !== clienteId) {
    throw new Error("Acesso negado. Você não pode deletar esta avaliação.");
  }

  await prisma.avaliacao.delete({ where: { id: avaliacaoId } });
}
