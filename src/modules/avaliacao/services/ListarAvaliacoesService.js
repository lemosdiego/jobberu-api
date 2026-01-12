import prisma from "../../../lib/prisma.js";

export default async function ListarAvaliacoesService(clienteId) {
  return await prisma.avaliacao.findMany({
    where: { clienteId: clienteId },
    include: {
      prestador: {
        select: { nome: true },
      },
      registro: true, // Inclui os dados do serviço (status, id, etc) para o front conferir
    },
  });
}
