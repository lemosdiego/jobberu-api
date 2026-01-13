import CreateUserService from "../services/CreateUserService.js";
import ListUserService from "../services/ListUserService.js";
import ListUsersIdService from "../services/ListUsersIdService.js";
import ListServicesProviderService from "../services/ListServicesProviderService.js";
import ListMyReviewsService from "../services/ListMyReviewsService.js";
import EditUserService from "../services/EditUserService.js";
import DeleteUserService from "../services/DeleteUserService.js";
import ListProvidersByCityService from "../services/ListProvidersByCityService.js";
import UpdateProviderLevelService from "../services/UpdateProviderLevelService.js";

//Criar Usuario
export async function createUser(req, res) {
  try {
    const user = await CreateUserService(req.body, req.file);
    return res.status(201).json(user);
  } catch (error) {
    if (error.message === "CEP inválido") {
      return res.status(400).json({ error: error.message });
    }
    console.error("Erro ao criar usuário:", error);
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
}

//Listar Usuarios
export async function listUsers(req, res) {
  try {
    const usuarios = await ListUserService();
    return res.status(200).json(usuarios);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar usuários" });
  }
}
//Buscar Usuario
export async function listUsersId(req, res) {
  try {
    const { id } = req.params;
    const usuario = await ListUsersIdService(id);
    return res.status(200).json(usuario);
  } catch (error) {
    if (error.message === "Usuário não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao buscar usuário" });
  }
}
//Listar Servicos do Prestador
export async function listProviderServices(req, res) {
  try {
    const { id } = req.params;
    const servicos = await ListServicesProviderService(id);
    return res.status(200).json(servicos);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Erro ao buscar serviços do prestador" });
  }
}
//Listar Minhas Avaliações
export async function listMyReviews(req, res) {
  try {
    const clienteId = req.usuario.id;
    const avaliacoes = await ListMyReviewsService(clienteId);
    return res.status(200).json(avaliacoes);
  } catch (error) {
    console.error("Erro ao listar minhas avaliações:", error);
    return res.status(500).json({ error: "Erro ao buscar avaliações." });
  }
}
//Editar Usuario
export async function editUser(req, res) {
  try {
    const usuarioIdParams = parseInt(req.params.id, 10);
    const usuarioIdToken = req.usuario.id;

    // 1. REGRA DE SEGURANÇA: O usuário só pode editar a si mesmo.
    if (usuarioIdParams !== usuarioIdToken) {
      return res.status(403).json({
        mensagem: "Acesso negado. Você só pode editar seu próprio perfil.",
      });
    }

    const usuarioAtualizado = await EditUserService(
      usuarioIdParams,
      req.body,
      req.file
    );
    return res.status(200).json(usuarioAtualizado);
  } catch (error) {
    console.error("Erro ao editar usuário:", error);
    // Adiciona mais detalhes ao log de erro para facilitar a depuração
    if (error.code === "P2025") {
      // Código de erro do Prisma para "Record not found"
      // Exemplo de código de erro do Prisma
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    return res.status(500).json({
      error: "Erro interno ao editar usuário",
      details: error.message,
    });
  }
}
//Deletar Usuario
export async function deleteUser(req, res) {
  try {
    const usuarioIdParams = parseInt(req.params.id, 10);
    const usuarioIdToken = req.usuario.id;

    // 1. REGRA DE SEGURANÇA: O usuário só pode deletar a si mesmo.
    if (usuarioIdParams !== usuarioIdToken) {
      return res.status(403).json({
        mensagem: "Acesso negado. Você só pode deletar seu próprio perfil.",
      });
    }

    await DeleteUserService(usuarioIdToken);
    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return res.status(500).json({ error: "Erro ao deletar usuário" });
  }
}
//Listar Prestadores por Cidade
export async function listProvidersByCity(req, res) {
  try {
    const { cidade } = req.params;
    const { categoria } = req.query;
    const prestadores = await ListProvidersByCityService(cidade, categoria);
    return res.status(200).json({ prestadores });
  } catch (error) {
    console.error("Erro ao listar prestadores por cidade:", error);
    return res.status(500).json({ error: "Erro ao buscar prestadores" });
  }
}

// --- FUNÇÕES DE GAMIFICAÇÃO ---
//Regras de Nivel de Prestadores

//Iniciante: Estado Padrão de todos os usuarios.
//Bronze: Mais que 8 avaliações com nota média igual ou maior que 4.5
//prata Mais que 20 avaliações com nota média igual ou maior que 4.5
//Ouro: Mais que 50 avaliações com nota média igual ou maior que 4.5
//Platina: Mais que 70 avaliações com nota média igual ou maior que 4.5
//Diamante: Mais que 100 avaliações com nota média igual ou maior que 4.5

/**
 * Calcula e atualiza o nível (selo) do prestador com base nas avaliações recebidas.
 * Deve ser chamada sempre que uma nova avaliação for aprovada.
 */
export async function updateProviderLevel(usuarioId) {
  try {
    return await UpdateProviderLevelService(usuarioId);
  } catch (error) {
    console.error(`Erro ao atualizar nível do prestador ${usuarioId}:`, error);
  }
}
