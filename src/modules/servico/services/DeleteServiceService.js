import prisma from "../../../lib/prisma.js";

export default async function DeleteServiceService(serviceId, prestadorId) {
  const id = parseInt(serviceId, 10);

  // verifica se o serviço pertence ao prestador logdo
  const servico = await prisma.servico.findUnique({
    where: { id },
  });

  // se o serviço nao existir
  if (!servico) {
    throw new Error("Serviço não encontrado.");
  }

  // verifica se o prestador é o mesmo do usuario logado
  if (servico.prestadorId !== prestadorId) {
    throw new Error("Prestador não autorizado a deletar este serviço.");
  }

  // se todos os testes passarem, deleta o serviço
  await prisma.servico.delete({ where: { id } });
}
