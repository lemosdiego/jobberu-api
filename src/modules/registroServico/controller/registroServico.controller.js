import BuscarClientePorCelularService from "../services/BuscarClientePorCelularService.js";
import SolicitarConfirmacaoService from "../services/SolicitarConfirmacaoService.js";
import ResponderSolicitacaoService from "../services/ResponderSolicitacaoService.js";

export async function buscarClientePorCelular(request, response) {
  try {
    const { celular } = request.query;
    const cliente = await BuscarClientePorCelularService(celular);
    return response.status(200).json(cliente);
  } catch (error) {
    if (error.message === "O número de celular é obrigatório para a busca.") {
      return response.status(400).json({ mensagem: error.message });
    }
    if (error.message === "Cliente não encontrado.") {
      return response.status(404).json({ mensagem: error.message });
    }
    console.error("Erro ao buscar cliente por celular:", error);
    return response.status(500).json({ mensagem: "Erro interno do servidor." });
  }
}

export async function solicitarConfirmacao(request, response) {
  try {
    // 1. VERIFICAÇÃO DE PERMISSÃO
    if (!request.usuario.is_prestador) {
      return response.status(403).json({
        mensagem: "Apenas prestadores podem solicitar confirmação de serviço.",
      });
    }

    const prestadorId = request.usuario.id;
    const { clienteId } = request.body;

    const novoRegistro = await SolicitarConfirmacaoService(
      prestadorId,
      clienteId
    );
    return response.status(201).json(novoRegistro);
  } catch (error) {
    if (error.message === "O ID do cliente é obrigatório.") {
      return response.status(400).json({ mensagem: error.message });
    }
    if (
      error.message === "Você não pode solicitar confirmação para si mesmo."
    ) {
      return response.status(400).json({ mensagem: error.message });
    }
    if (error.message === "Cliente não encontrado.") {
      return response.status(404).json({ mensagem: error.message });
    }
    if (
      error.message === "Já existe uma solicitação pendente para este cliente."
    ) {
      return response.status(409).json({ mensagem: error.message });
    }
    console.error("Erro ao solicitar confirmação:", error);
    return response.status(500).json({ mensagem: "Erro interno do servidor." });
  }
}

export async function responderSolicitacao(request, response) {
  try {
    const registroId = parseInt(request.params.id, 10);
    const clienteIdLogado = request.usuario.id;
    const { resposta } = request.body;

    const registroAtualizado = await ResponderSolicitacaoService(
      registroId,
      clienteIdLogado,
      resposta
    );

    return response.status(200).json(registroAtualizado);
  } catch (error) {
    if (error.message === "A resposta deve ser 'CONCLUIDO' ou 'RECUSADO'.") {
      return response.status(400).json({ mensagem: error.message });
    }
    if (error.message === "Solicitação de serviço não encontrada.") {
      return response.status(404).json({ mensagem: error.message });
    }
    if (
      error.message ===
      "Você não tem permissão para responder a esta solicitação."
    ) {
      return response.status(403).json({ mensagem: error.message });
    }
    if (error.message.includes("Esta solicitação já foi respondida")) {
      return response.status(409).json({ mensagem: error.message });
    }
    console.error("Erro ao responder solicitação:", error);
    return response.status(500).json({ mensagem: "Erro interno do servidor." });
  }
}
