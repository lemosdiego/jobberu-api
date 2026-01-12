import prisma from "../../../lib/prisma.js";

export default async function VerificarDisponibilidadeService(
  clienteId,
  prestadorId
) {
  if (!prestadorId) {
    throw new Error("O ID do prestador é obrigatório.");
  }

  // Busca se existe algum registro CONCLUIDO entre as partes que ainda NÃO tem avaliação
  const registroPendente = await prisma.registroServico.findFirst({
    where: {
      clienteId: clienteId,
      prestadorId: parseInt(prestadorId, 10),
      status: "CONCLUIDO",
      avaliacao: null, // Verifica se a relação de avaliação não existe (é nula)
    },
    select: { id: true },
  });

  if (registroPendente) {
    return { disponivel: true, registroId: registroPendente.id };
  }

  return { disponivel: false };
}
