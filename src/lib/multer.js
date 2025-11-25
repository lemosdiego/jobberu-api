import multer from "multer";
import path from "path";
import crypto from "crypto";

// __dirname não é disponível em ES Modules, então usamos uma alternativa
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define o diretório de destino para os uploads temporários
// path.resolve garante que o caminho seja absoluto e correto, independente do sistema operacional.
// '..', '..', 'tmp' significa: volte duas pastas (de /lib/ para /src/, de /src/ para a raiz) e entre em /tmp.
const tmpFolder = path.resolve(__dirname, "..", "..", "tmp");

export default {
  directory: tmpFolder,

  // Estratégia de armazenamento: salvar em disco.
  storage: multer.diskStorage({
    destination: tmpFolder,
    filename(request, file, callback) {
      // Gera 16 bytes de dados aleatórios para criar um hash único.
      const fileHash = crypto.randomBytes(16).toString("hex");
      // Concatena o hash com o nome original do arquivo para garantir que seja único.
      const fileName = `${fileHash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),

  // Filtro para aceitar apenas certos tipos de arquivos (imagens, neste caso).
  fileFilter: (request, file, callback) => {
    const allowedMimes = [
      "image/jpeg",
      "image/pjpeg", // Variação para jpeg
      "image/png",
      "image/gif",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true); // Aceita o arquivo.
    } else {
      // Rejeita o arquivo e passa um erro para o callback.
      callback(
        new Error("Tipo de arquivo inválido. Apenas imagens são permitidas.")
      );
    }
  },

  // Limite de tamanho do arquivo (ex: 2MB).
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB em bytes
  },
};
