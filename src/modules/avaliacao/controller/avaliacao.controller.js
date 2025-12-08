import prisma from "../../../lib/prisma.js";

export async function criarAvaliacao(request, response) {
  try {
    const { registroId, nota, comentario } = request.body;
    const clienteId = request.usuario.id;

    const registro = await prisma.registroServico.findUnique({
      where: { id: registroId },
      include: { avaliacao: true },
    });

    //VERIFICA SE O REGISTRO EXISTE
    if (!registro) {
      return response.status(404).json({ mensagem: "Registro nao existe" });
    }
    //VERIFICA SE O USUARIO LOGADO É O MESMO DO REGISTRO
    if (registro.clienteId !== clienteId) {
      return response
        .status(403)
        .json({ mensagem: "Você nao tem permissão para avaliar este erviço" });
    }
    //VERIFICA SE O STATUS TÁ CONCLUIDO
    if (registro.status !== "CONCLUIDO") {
      return response
        .status(403)
        .json({ mensagem: "Esse serviço nao pode ser avaliado" });
    }
    //VERIFICA DE JA EXISTE UMA AVALIAÇÃO PARA ESSE REGISTRO, GARANTINDO QUE O MESMO NAO AVALIE DUAS VEZES
    if (registro.avaliacao) {
      return response
        .status(409)
        .json({ mensagem: "Este serviço ja foi avaliado" });
    }

    //PASSANDO AS ETAPAS CRIAREMOS UMA AVALIAÇÃO

    const novaAvaliacao = await prisma.avaliacao.create({
      data: {
        nota: parseInt(nota, 10),
        comentario,
        clienteId: clienteId,
        prestadorId: registro.prestadorId,
        registroId: registro.id, // CORREÇÃO: Passar o ID do registro, não o objeto inteiro.
      },
    });

    // Busca a avaliação recém-criada para retornar com os dados do cliente e prestador.
    const avaliacaoCompleta = await prisma.avaliacao.findUnique({
      where: { id: novaAvaliacao.id },
      include: {
        cliente: {
          select: {
            nome: true,
            foto_perfil_url: true,
          },
        },
        prestador: {
          select: {
            nome: true,
          },
        },
      },
    });

    return response.status(201).json(avaliacaoCompleta);
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    return response.status(500).json({ mensagem: "Erro ao criar avaliação." });
  }
}

export async function editarAvaliacao(request, response) {
  try {
    const avaliacaoId = parseInt(request.params.id, 10);
    const clienteId = request.usuario.id;
    const { nota, comentario } = request.body;

    // 1. Busca a avaliação para verificar o proprietário
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: avaliacaoId },
    });

    if (!avaliacao) {
      return response
        .status(404)
        .json({ mensagem: "Avaliação não encontrada." });
    }

    // 2. REGRA DE SEGURANÇA: O usuário logado é o dono da avaliação?
    if (avaliacao.clienteId !== clienteId) {
      return response.status(403).json({
        mensagem: "Acesso negado. Você não pode editar esta avaliação.",
      });
    }

    // 3. Atualiza a avaliação
    const avaliacaoAtualizada = await prisma.avaliacao.update({
      where: { id: avaliacaoId },
      data: {
        nota: nota ? parseInt(nota, 10) : undefined,
        comentario: comentario,
      },
    });

    return response.status(200).json(avaliacaoAtualizada);
  } catch (error) {
    console.error("Erro ao editar avaliação:", error);
    return response.status(500).json({ mensagem: "Erro ao editar avaliação." });
  }
}

export async function deletarAvaliacao(request, response) {
  try {
    const avaliacaoId = parseInt(request.params.id, 10);
    const clienteId = request.usuario.id;

    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: avaliacaoId },
    });

    if (!avaliacao) {
      return response
        .status(404)
        .json({ mensagem: "Avaliação não encontrada." });
    }

    if (avaliacao.clienteId !== clienteId) {
      return response.status(403).json({
        mensagem: "Acesso negado. Você não pode deletar esta avaliação.",
      });
    }

    await prisma.avaliacao.delete({ where: { id: avaliacaoId } });

    return response.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar avaliação:", error);
    return response
      .status(500)
      .json({ mensagem: "Erro ao deletar avaliação." });
  }
}
