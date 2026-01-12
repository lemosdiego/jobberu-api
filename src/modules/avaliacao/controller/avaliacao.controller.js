import CriarAvaliacaoService from "../services/CriarAvaliacaoService.js";
import ListarAvaliacoesService from "../services/ListarAvaliacoesService.js";
import EditarAvaliacaoService from "../services/EditarAvaliacaoService.js";
import DeletarAvaliacaoService from "../services/DeletarAvaliacaoService.js";
import VerificarDisponibilidadeService from "../services/VerificarDisponibilidadeService.js";

export async function criarAvaliacao(request, response) {
  try {
    const clienteId = request.usuario.id;
    const avaliacao = await CriarAvaliacaoService(request.body, clienteId);
    return response.status(201).json(avaliacao);
  } catch (error) {
    if (error.message === "Registro nao existe") {
      return response.status(404).json({ mensagem: error.message });
    }
    if (error.message === "Você nao tem permissão para avaliar este serviço") {
      return response.status(403).json({ mensagem: error.message });
    }
    if (error.message === "Esse serviço nao pode ser avaliado") {
      return response.status(403).json({ mensagem: error.message });
    }
    if (error.message === "Este serviço ja foi avaliado") {
      return response.status(409).json({ mensagem: error.message });
    }
    console.error("Erro ao criar avaliação:", error);
    return response.status(500).json({ mensagem: "Erro ao criar avaliação." });
  }
}

export async function listarAvaliacoes(request, response) {
  try {
    const clienteId = request.usuario.id;
    const avaliacoes = await ListarAvaliacoesService(clienteId);
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

    const avaliacaoAtualizada = await EditarAvaliacaoService(
      avaliacaoId,
      clienteId,
      request.body
    );
    return response.status(200).json(avaliacaoAtualizada);
  } catch (error) {
    if (error.message === "Avaliação não encontrada.") {
      return response.status(404).json({ mensagem: error.message });
    }
    if (
      error.message === "Acesso negado. Você não pode editar esta avaliação."
    ) {
      return response.status(403).json({ mensagem: error.message });
    }
    console.error("Erro ao editar avaliação:", error);
    return response.status(500).json({ mensagem: "Erro ao editar avaliação." });
  }
}

export async function deletarAvaliacao(request, response) {
  try {
    const avaliacaoId = parseInt(request.params.id, 10);
    const clienteId = request.usuario.id;
    await DeletarAvaliacaoService(avaliacaoId, clienteId);
    return response.status(204).send();
  } catch (error) {
    if (error.message === "Avaliação não encontrada.") {
      return response.status(404).json({ mensagem: error.message });
    }
    if (
      error.message === "Acesso negado. Você não pode deletar esta avaliação."
    ) {
      return response.status(403).json({ mensagem: error.message });
    }
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
    const resultado = await VerificarDisponibilidadeService(
      clienteId,
      prestadorId
    );
    return response.status(200).json(resultado);
  } catch (error) {
    if (error.message === "O ID do prestador é obrigatório.") {
      return response.status(400).json({ mensagem: error.message });
    }
    console.error("Erro ao verificar disponibilidade:", error);
    return response.status(500).json({ mensagem: "Erro interno." });
  }
}
