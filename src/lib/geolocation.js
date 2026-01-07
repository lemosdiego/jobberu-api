export async function consultZipCoordinates(cep) {
  try {
    // 1. Busca dados no ViaCEP
    const respostaViaCep = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dadosEndereco = await respostaViaCep.json();

    if (dadosEndereco.erro) {
      throw new Error("CEP inválido");
    }

    // 2. Busca coordenadas no Nominatim usando o endereço retornado
    const enderecoCompleto = `${dadosEndereco.logradouro}, ${dadosEndereco.localidade}, ${dadosEndereco.uf}`;
    const respostaNominatim = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        enderecoCompleto
      )}`,
      { headers: { "User-Agent": "JobberU App/1.0 (seu-contato@email.com)" } }
    );
    const dadosGeograficos = await respostaNominatim.json();

    let lat = null;
    let lon = null;
    if (dadosGeograficos && dadosGeograficos.length > 0) {
      lat = parseFloat(dadosGeograficos[0].lat);
      lon = parseFloat(dadosGeograficos[0].lon);
    }

    return { lat, lon };
  } catch (error) {
    // Se o erro for de CEP inválido, repassa para o Service tratar
    throw error;
  }
}
