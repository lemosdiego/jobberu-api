import carregarNoCloudinary from "../../../lib/cloudinary.js";
import prisma from "../../../lib/prisma.js";

export async function criarServico(request, response) {
  try {
    // Verifica permissão, apenas usuarios do tipo "PRESTADOR" podem criar serviçoa
    if (request.usuario.tipo !== "PRESTADOR") {
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
export async function listarServiços(request, response) {
  try {
    const servicos = await prisma.servico.findMany();
    return response.status(200).json(servicos);
  } catch (erro) {
    console.error("Erro ao listar serviços:", erro);
    return response.status(500).json({ mensagem: "Erro ao listar serviços" });
  }
}
