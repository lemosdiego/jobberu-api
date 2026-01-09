import prisma from "../../../lib/prisma.js";
import carregarNoCloudinary from "../../../lib/cloudinary.js";

export default async function CreateServiceService(
  dados,
  arquivos,
  prestadorId
) {
  const { titulo, descricao, categoria, preco } = dados;
  let imagensUrl = [];

  // 1. Upload de imagens para o Cloudinary
  if (arquivos && arquivos.length > 0) {
    const uploadPromises = arquivos.map((file) =>
      carregarNoCloudinary(file.path, "imagens_servicos")
    );
    imagensUrl = await Promise.all(uploadPromises);
  }

  // 2. Monta o objeto de dados
  const dadosServico = {
    titulo,
    descricao,
    categoria,
    imagens: imagensUrl,
    prestadorId: prestadorId,
  };

  // 3. Converte o preço para número, se existir
  if (preco) {
    dadosServico.preco = parseFloat(preco);
  }

  // 4. Cria e retorna o serviço
  return await prisma.servico.create({ data: dadosServico });
}
