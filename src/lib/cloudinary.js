import { v2 as cloudinary } from "cloudinary";
import "dotenv/config"; // Garante que as variáveis de ambiente sejam carregadas

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function carregarNoCloudinary(caminhoDoArquivo, pasta) {
  try {
    //carrega e avisa o a pasta de destino da imagem
    const resultado = await cloudinary.uploader.upload(caminhoDoArquivo, {
      folder: pasta,
    });
    // e retorna a url segura da imagem para seguir o fluxo de salvar no banco de dados
    return resultado.secure_url;
  } catch (erro) {
    console.error("Erro ao carregar imagem para o cloudinary", erro);
    throw new Error("Falha ao carregar imagem ");
  }
}
