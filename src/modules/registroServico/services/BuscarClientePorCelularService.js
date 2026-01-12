import prisma from "../../../lib/prisma.js";

export default async function BuscarClientePorCelularService(celular) {
  if (!celular) {
    throw new Error("O número de celular é obrigatório para a busca.");
  }

  // Normaliza o número de celular, removendo todos os caracteres não numéricos.
  const celularLimpo = celular.replace(/\D/g, "");

  const cliente = await prisma.usuario.findFirst({
    where: { telefone: celularLimpo },
    select: {
      id: true,
      nome: true,
      foto_perfil_url: true,
    },
  });

  if (!cliente) {
    throw new Error("Cliente não encontrado.");
  }

  return cliente;
}
