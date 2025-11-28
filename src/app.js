import express from "express";
import cors from "cors";

import usuarioRouter from "./modules/usuario/routes/usuario.routes.js";
import servicoRouter from "./modules/servico/routes/servico.routes.js";
import avaliacaoRouter from "./modules/avaliacao/routers/avaliacao.routes.js"; // Corrigido: 'routers' em vez de 'routes'
import registroRouter from "./modules/registroServico/registroServico.routes.js"; // Adicionado: importação do registroRouter

const app = express();
app.use(cors());
app.use(express.json());
app.use("/usuario", usuarioRouter);
app.use("/servico", servicoRouter);
app.use("/avaliacao", avaliacaoRouter);
app.use("/registro-servico", registroRouter);

export default app;
