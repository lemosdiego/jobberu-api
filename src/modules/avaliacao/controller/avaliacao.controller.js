import prisma from "../../../lib/prisma.js";

export async function criarAvaliacao(request, response) {
  try {
    const prestadorId = parseInt(request.params.prestadorId, 10);
    const clienteId = request.usuario.id;
    const { nota, comentario } = request.body;

    // 1. Verifica se o usuário logado é um CLIENTE
    if (request.usuario.tipo !== "CLIENTE") {
      return response
        .status(403)
        .json({ mensagem: "Apenas clientes podem fazer avaliações." });
    }

    // 2. Verifica se o alvo da avaliação existe e é um PRESTADOR
    const prestador = await prisma.usuario.findUnique({
      where: { id: prestadorId },
    });
    if (!prestador || prestador.tipo !== "PRESTADOR") {
      return response
        .status(404)
        .json({ mensagem: "Prestador não encontrado." });
    }

    // 3. Regra de negócio: Cliente não pode avaliar a si mesmo (embora o tipo já impeça isso, é uma boa dupla verificação)
    if (clienteId === prestadorId) {
      return response
        .status(403)
        .json({ mensagem: "Você não pode avaliar a si mesmo." });
    }

    // 4. Criar a avaliação (sem a necessidade de vínculo)
    const novaAvaliacao = await prisma.avaliacao.create({
      data: {
        nota: parseInt(nota, 10),
        comentario,
        clienteId,
        prestadorId,
      },
    });
    return response.status(201).json(novaAvaliacao);
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
