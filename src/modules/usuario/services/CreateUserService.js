import bcrypt from "bcryptjs";
import prisma from "../../../lib/prisma.js";
import carregarNoCloudinary from "../../../lib/cloudinary.js";
import { consultZipCoordinates } from "../../../lib/geolocation.js";

export default async function CreateUserService(data, file) {
  // Desestrutura TODOS os campos do front (incluindo endereço visual)
  const {
    nome,
    email,
    senha,
    telefone,
    is_prestador,
    cep,
    logradouro,
    bairro,
    numero,
    cidade,
    estado, // ← ADICIONADO
    titulo_profissional,
    biografia,
    anos_experiencia,
    links_redes_sociais,
  } = data;

  const isPrestadorBoolean = is_prestador === "true";

  try {
    let lat = null;
    let lon = null;

    const senhaHash = await bcrypt.hash(senha, 10);
    let fotoPerfilUrl = null;
    if (file) {
      fotoPerfilUrl = await carregarNoCloudinary(
        file.path,
        "fotos_perfil_usuarios"
      );
    }

    // --- GEOLOCALIZAÇÃO (só pra lat/lon) ---
    if (cep) {
      const coordenadas = await consultZipCoordinates(cep);
      if (coordenadas) {
        lat = coordenadas.lat;
        lon = coordenadas.lon;
      }
    }

    // ✅ SALVA ENDEREÇO DO FRONT (visual) + geolocalização
    const dadosUsuario = {
      nome,
      email,
      senha: senhaHash,
      telefone,
      is_prestador: isPrestadorBoolean,
      cep,
      logradouro,
      bairro,
      numero, // ← FRONT VISUAL SALVO!
      cidade,
      estado, // ← Front ou ViaCEP
      latitude: lat,
      longitude: lon,
      foto_perfil_url: fotoPerfilUrl,
    };

    // Campos prestador...
    if (isPrestadorBoolean) {
      if (titulo_profissional !== undefined)
        dadosUsuario.titulo_profissional = titulo_profissional;
      if (biografia !== undefined) dadosUsuario.biografia = biografia;
      if (anos_experiencia !== undefined)
        dadosUsuario.anos_experiencia = parseInt(anos_experiencia, 10);
      if (links_redes_sociais !== undefined) {
        dadosUsuario.links_redes_sociais = Array.isArray(links_redes_sociais)
          ? links_redes_sociais
          : [links_redes_sociais];
      }
    }

    const usuario = await prisma.usuario.create({ data: dadosUsuario });
    const { senha: _, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  } catch (error) {
    // Repassa o erro para o controller tratar
    throw error;
  }
}
