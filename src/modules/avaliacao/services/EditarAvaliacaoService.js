import prisma from "../../../lib/prisma.js";

export default async function EditarAvaliacaoService(
  avaliacaoId,
  clienteId,
  dados
) {
  const { nota, comentario } = dados;

  // 1. Busca a avaliação para verificar o proprietário
  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id: avaliacaoId },
  });

  if (!avaliacao) {
    throw new Error("Avaliação não encontrada.");
  }

  // 2. REGRA DE SEGURANÇA: O usuário logado é o dono da avaliação?
  if (avaliacao.clienteId !== clienteId) {
    throw new Error("Acesso negado. Você não pode editar esta avaliação.");
  }

  // 3. Atualiza a avaliação
  return await prisma.avaliacao.update({
    where: { id: avaliacaoId },
    data: {
      nota: nota ? parseInt(nota, 10) : undefined,
      comentario: comentario,
    },
  });
}
