import carregarNoCloudinary from "../../../lib/cloudinary.js";
import prisma from "../../../lib/prisma.js";

export async function criarServico(request, response) {
  try {
    // Verifica permissão, apenas usuários que são prestadores podem criar serviços
    if (!request.usuario.is_prestador) {
      return response
        .status(403)
        .json({ mensagem: "Apenas prestadores podem criar serviços" });
    }
    //coleta todos os dados que precisamos para fazer a requisição
    const { titulo, descricao, categoria, preco } = request.body;
    const imagensServico = request.files;
    const prestadorId = request.usuario.id;
    // indica para o cloudnary que vai ser um array de imagens
    let imagensUrl = [];

    if (imagensServico && imagensServico.length > 0) {
      // cria uma promessa para cada upload de imagem no cloudinary
      const uploadPromises = imagensServico.map((file) =>
        carregarNoCloudinary(file.path, "imagens_servicos")
      );
      // aguarda todas as promessas serem resolvidas
      const resolveUrls = await Promise.all(uploadPromises);
      imagensUrl = resolveUrls;
    }
    // Monda o objeto de dados do serviço para salvar no banco
    const dadosServico = {
      titulo,
      descricao,
      categoria,
      imagens: imagensUrl,
      prestadorId: prestadorId,
    };
    // Converte o preço para número
    if (preco) {
      dadosServico.preco = parseFloat(preco);
    }
    // Cria o serviço no banco de dados
    const novoServico = await prisma.servico.create({ data: dadosServico });
    // Retorna sucesso
    return response.status(201).json(novoServico);
  } catch (erro) {
    // Caso contrario retorna erro
    console.error("Erro ao criar servilo:", erro);
    return response.status(500).json({ mensagem: "Erro ao criar serviço" });
  }
}
export async function listarServicos(request, response) {
  try {
    const servicos = await prisma.servico.findMany();
    return response.status(200).json(servicos);
  } catch (erro) {
    console.error("Erro ao listar serviços:", erro);
    return response.status(500).json({ mensagem: "Erro ao listar serviços" });
  }
}
export async function listarServicoId(request, response) {
  try {
    const { id } = request.params;
    const servico = await prisma.servico.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        prestador: {
          select: {
            id: true,
            nome: true,
            foto_perfil_url: true,
            // outros campos públicos do prestador que queira expor
          },
        },
      },
    });
    if (!servico) {
      return response.status(404).json({ mensagem: "Serviço não encontrado" });
    }
    return response.status(200).json(servico);
  } catch (erro) {
    console.error("Erro ao listar serviço:", erro);
    return response.status(500).json({ mensagem: "Erro ao listar serviço" });
  }
}
export async function editarServico(request, response) {
  try {
    // Verificação de tipo por segurança
    if (!request.usuario.is_prestador) {
      return response
        .status(403)
        .json({ mensagem: "Apenas prestadores podem editar serviços." });
    }
    // coleta os ids de serviço, usuario PRESTADOR logado e dados do front end envia para atualizar
    const servicoId = parseInt(request.params.id, 10);
    const prestadorId = request.usuario.id;
    const novosDados = request.body;

    //verificação de autorização, se o serviço pertence ao prestador logado
    const servico = await prisma.servico.findUnique({
      where: { id: servicoId },
    });
    // se o serviço nao existir?
    if (!servico) {
      return response.status(404).json({ mensagem: "Serviço não encontrado." });
    }
    // verifica se o prestador é o mesmo do usuario logado
    if (servico.prestadorId !== prestadorId) {
      return response
        .status(403)
        .json({ mensagem: "Prestador não autorizado a editar este serviço." });
    }
    // se todos os testes passarem, atualiza o serviço
    const servicoAtualizado = await prisma.servico.update({
      where: { id: servicoId },
      data: novosDados,
    });
    return response.status(200).json(servicoAtualizado);
  } catch (erro) {
    console.error("Erro ao editar serviço:", erro);
    return response.status(500).json({ mensagem: "Erro ao editar serviço." });
  }
}
export async function deletarServico(request, response) {
  try {
    // verificar tipo por segurança
    if (!request.usuario.is_prestador) {
      return response
        .status(403)
        .json({ mensagem: "Apenas prestadores podem deletar serviços" });
    }
    //coleta os ids de serviço e prestador logado
    const servicoId = parseInt(request.params.id, 10);
    const prestadorId = request.usuario.id;

    // verifica se o serviço pertence ao prestador logdo
    const servico = await prisma.servico.findUnique({
      where: { id: servicoId },
    });
    // se o serviço nao existir
    if (!servico) {
      return response.status(404).json({ mensagem: "Serviço não encontrado." });
    }
    // verifica se o prestador é o mesmo do usuario logado
    if (servico.prestadorId !== prestadorId) {
      return response
        .status(403)
        .json({ mensagem: "Prestador não autorizado a deletar este serviço." });
    }
    // se todos os testes passarem, deleta o serviço
    await prisma.servico.delete({ where: { id: servicoId } });
    return response.status(204).send(); // 204 No Content é a resposta padrão para delete.
  } catch (erro) {
    console.error("Erro ao deletar serviço:", erro);
    return response.status(500).json({ mensagem: "Erro ao deletar serviço" });
  }
}
