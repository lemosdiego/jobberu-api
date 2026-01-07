import prisma from "../../../lib/prisma.js";

export default async function UpdateProviderLevelService(usuarioId) {
  const id =
    typeof usuarioId === "string" ? parseInt(usuarioId, 10) : usuarioId;

  // 1. Busca estatísticas das avaliações APROVADAS
  const estatisticas = await prisma.avaliacao.aggregate({
    where: {
      prestadorId: id,
      aprovada: true,
    },
    _avg: {
      nota: true,
    },
    _count: {
      nota: true,
    },
  });

  const totalAvaliacoes = estatisticas._count.nota || 0;
  const mediaNota = estatisticas._avg.nota || 0;

  // 2. Regras de Gamificação
  let novoNivel = "Iniciante";

  if (totalAvaliacoes > 100 && mediaNota >= 4.5) {
    novoNivel = "Diamante";
  } else if (totalAvaliacoes > 70 && mediaNota >= 4.5) {
    novoNivel = "Platina";
  } else if (totalAvaliacoes > 50 && mediaNota >= 4.5) {
    novoNivel = "Ouro";
  } else if (totalAvaliacoes > 20 && mediaNota >= 4.5) {
    novoNivel = "Prata";
  } else if (totalAvaliacoes > 8 && mediaNota >= 4.5) {
    novoNivel = "Bronze";
  }

  // 3. Atualiza o usuário no banco
  await prisma.usuario.update({
    where: { id: id },
    data: { nivel_prestador: novoNivel },
  });

  return novoNivel;
}
