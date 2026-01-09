import CreateServiceService from "../services/CreateServiceService.js";
import ListServiceService from "../services/ListServiceService.js";
import ListServiceIdService from "../services/ListServiceIdService.js";
import EditServiceService from "../services/EditServiceService.js";
import DeleteServiceService from "../services/DeleteServiceService.js";

// Criar um novo serviço
export async function createService(request, response) {
  try {
    // Verifica permissão, apenas usuários que são prestadores podem criar serviços
    if (!request.usuario.is_prestador) {
      return response
        .status(403)
        .json({ mensagem: "Apenas prestadores podem criar serviços" });
    }

    const novoServico = await CreateServiceService(
      request.body,
      request.files,
      request.usuario.id
    );
    // Retorna sucesso
    return response.status(201).json(novoServico);
  } catch (erro) {
    // Caso contrario retorna erro
    console.error("Erro ao criar servilo:", erro);
    return response.status(500).json({ mensagem: "Erro ao criar serviço" });
  }
}
// Listar todos os serviços
export async function listService(request, response) {
  try {
    const servicos = await ListServiceService();
    return response.status(200).json(servicos);
  } catch (erro) {
    console.error("Erro ao listar serviços:", erro);
    return response.status(500).json({ mensagem: "Erro ao listar serviços" });
  }
}
// Listar serviço por ID
export async function listServiceId(request, response) {
  try {
    const { id } = request.params;
    const servico = await ListServiceIdService(id);
    return response.status(200).json(servico);
  } catch (erro) {
    if (erro.message === "Serviço não encontrado") {
      return response.status(404).json({ mensagem: erro.message });
    }
    console.error("Erro ao listar serviço:", erro);
    return response.status(500).json({ mensagem: "Erro ao listar serviço" });
  }
}
// Editar um serviço existente
export async function editService(request, response) {
  try {
    if (!request.usuario.is_prestador) {
      return response
        .status(403)
        .json({ mensagem: "Apenas prestadores podem editar serviços." });
    }

    const servicoAtualizado = await EditServiceService(
      request.params.id,
      request.usuario.id,
      request.body,
      request.files
    );
    return response.status(200).json(servicoAtualizado);
  } catch (erro) {
    if (erro.message === "Serviço não encontrado.") {
      return response.status(404).json({ mensagem: erro.message });
    }
    if (erro.message === "Você não tem permissão para editar este serviço.") {
      return response.status(403).json({ mensagem: erro.message });
    }
    if (erro.message === "O preço fornecido é inválido.") {
      return response.status(400).json({ mensagem: erro.message });
    }

    console.error("ERRO DETALHADO AO EDITAR SERVIÇO:", erro);
    return response
      .status(500)
      .json({ mensagem: "Erro interno ao editar o serviço." });
  }
}
// Deletar um serviço
export async function deleteService(request, response) {
  try {
    // verificar tipo por segurança
    if (!request.usuario.is_prestador) {
      return response
        .status(403)
        .json({ mensagem: "Apenas prestadores podem deletar serviços" });
    }

    await DeleteServiceService(request.params.id, request.usuario.id);
    return response.status(204).send(); // 204 No Content é a resposta padrão para delete.
  } catch (erro) {
    if (erro.message === "Serviço não encontrado.") {
      return response.status(404).json({ mensagem: erro.message });
    }
    if (erro.message === "Prestador não autorizado a deletar este serviço.") {
      return response.status(403).json({ mensagem: erro.message });
    }
    console.error("Erro ao deletar serviço:", erro);
    return response.status(500).json({ mensagem: "Erro ao deletar serviço" });
  }
}
