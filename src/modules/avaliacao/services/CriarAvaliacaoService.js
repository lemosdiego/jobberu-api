import prisma from "../../../lib/prisma.js";

export default async function CriarAvaliacaoService(dados, clienteId) {
  const { registroId, nota, comentario } = dados;

  const registro = await prisma.registroServico.findUnique({
    where: { id: registroId },
    include: { avaliacao: true },
  });

  // VERIFICA SE O REGISTRO EXISTE
  if (!registro) {
    throw new Error("Registro nao existe");
  }

  // VERIFICA SE O USUARIO LOGADO É O MESMO DO REGISTRO
  if (registro.clienteId !== clienteId) {
    throw new Error("Você nao tem permissão para avaliar este serviço");
  }

  // VERIFICA SE O STATUS TÁ CONCLUIDO
  if (registro.status !== "CONCLUIDO") {
    throw new Error("Esse serviço nao pode ser avaliado");
  }

  // VERIFICA DE JA EXISTE UMA AVALIAÇÃO PARA ESSE REGISTRO
  const jaAvaliado = Array.isArray(registro.avaliacao)
    ? registro.avaliacao.length > 0
    : registro.avaliacao;

  if (jaAvaliado) {
    throw new Error("Este serviço ja foi avaliado");
  }

  // PASSANDO AS ETAPAS CRIAREMOS UMA AVALIAÇÃO
  const novaAvaliacao = await prisma.avaliacao.create({
    data: {
      nota: parseInt(nota, 10),
      comentario,
      clienteId: clienteId,
      prestadorId: registro.prestadorId,
      registroId: registro.id,
    },
  });

  // Busca a avaliação recém-criada para retornar com os dados do cliente e prestador.
  return await prisma.avaliacao.findUnique({
    where: { id: novaAvaliacao.id },
    include: {
      cliente: {
        select: {
          nome: true,
          foto_perfil_url: true,
        },
      },
      prestador: {
        select: { nome: true },
      },
    },
  });
}
