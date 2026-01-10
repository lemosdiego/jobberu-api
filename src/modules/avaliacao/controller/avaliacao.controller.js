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
    //Verificação robusta: suporta tanto objeto (1:1) quanto array (1:N) para evitar bugs futuros
    const jaAvaliado = Array.isArray(registro.avaliacao)
      ? registro.avaliacao.length > 0
      : registro.avaliacao;

    if (jaAvaliado) {
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

export async function listarAvaliacoes(request, response) {
  try {
    const clienteId = request.usuario.id;

    const avaliacoes = await prisma.avaliacao.findMany({
      where: { clienteId: clienteId },
      include: {
        prestador: {
          select: {
            nome: true,
          },
        },
        registro: true, // Inclui os dados do serviço (status, id, etc) para o front conferir
      },
    });

    return response.status(200).json(avaliacoes);
  } catch (error) {
    console.error("Erro ao listar avaliações:", error);
    return response
      .status(500)
      .json({ mensagem: "Erro ao listar avaliações." });
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

export async function verificarDisponibilidade(request, response) {
  try {
    const clienteId = request.usuario.id;
    const { prestadorId } = request.query;

    if (!prestadorId) {
      return response
        .status(400)
        .json({ mensagem: "O ID do prestador é obrigatório." });
    }

    // Busca se existe algum registro CONCLUIDO entre as partes que ainda NÃO tem avaliação
    const registroPendente = await prisma.registroServico.findFirst({
      where: {
        clienteId: clienteId,
        prestadorId: parseInt(prestadorId, 10),
        status: "CONCLUIDO",
        avaliacao: null, // Verifica se a relação de avaliação não existe (é nula)
      },
      select: {
        id: true, // Só precisamos do ID para criar a avaliação depois
      },
    });

    if (registroPendente) {
      return response
        .status(200)
        .json({ disponivel: true, registroId: registroPendente.id });
    }

    return response.status(200).json({ disponivel: false });
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error);
    return response.status(500).json({ mensagem: "Erro interno." });
  }
}
