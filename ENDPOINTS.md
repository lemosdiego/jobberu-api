# Guia de Endpoints da API Jobberu

Este documento é o guia prático para desenvolvedores consumirem a API do JobberU. Cada endpoint é explicado com seu propósito, cenário de uso e exemplos práticos.

**Ferramentas Recomendadas:** [Postman](https://www.postman.com/), [Insomnia](https://insomnia.rest/) ou `curl`.

### Autenticação

Endpoints marcados com `🔒` requerem um Token de Autenticação.

1.  **Obtenha o Token:** Faça uma requisição `POST /usuario/login` com email e senha.
2.  **Use o Token:** Em todas as requisições subsequentes para rotas protegidas, inclua o cabeçalho `Authorization` no formato `Bearer SEU_TOKEN_AQUI`.

---

## 1. Módulo de Usuários

| Método   | Rota                                  | Descrição                                       | Autenticação |
| :------- | :------------------------------------ | :---------------------------------------------- | :----------- |
| `POST`   | `/usuario/create`                     | Cria um novo usuário (cliente ou prestador).    | Pública      |
| `POST`   | `/usuario/login`                      | Autentica um usuário e retorna um token JWT.    | Pública      |
| `GET`    | `/usuario/prestadores/cidade/:cidade` | Lista prestadores de uma cidade específica.     | Pública      |
| `GET`    | `/usuario/:id`                        | Busca o perfil público de um usuário.           | Pública      |
| `GET`    | `/usuario/:id/servicos`               | Lista todos os serviços de um prestador.        | Pública      |
| `GET`    | `/usuario/me/avaliacoes`              | Lista as avaliações feitas pelo usuário logado. | `🔒`         |
| `PATCH`  | `/usuario/atualizar/:id`              | Atualiza os dados do próprio perfil.            | `🔒`         |
| `DELETE` | `/usuario/excluir/:id`                | Deleta o próprio perfil.                        | `🔒`         |

---

#### `POST /usuario/create`

- **Cenário de Uso:** Quando um novo visitante decide se cadastrar na plataforma, seja para contratar ou para oferecer serviços.
- **Corpo:** `multipart/form-data`.
- **Campos:** `nome`, `email`, `senha`, `telefone`, `is_prestador` (booleano `true` ou `false`), `cep`, `foto_perfil` (opcional).

---

#### `POST /usuario/login`

- **Cenário de Uso:** Quando um usuário retorna à plataforma e precisa acessar sua conta para ver seu dashboard ou interagir com outros usuários.
- **Corpo (JSON):** `{ "email": "seu-email@email.com", "senha": "sua-senha" }`
- **Resposta de Sucesso:** Retorna um objeto contendo o `token` e os dados do `usuario`.

---

#### `GET /usuario/prestadores/cidade/:cidade`

- **Cenário de Uso:** Na página inicial, quando um visitante busca por profissionais em sua cidade (ex: "Santo André"). É o principal endpoint de descoberta da plataforma.
- **Parâmetro de URL:** `:cidade` (usar hífen para espaços, ex: `Santo-Andre`).

---

## 2. Módulo de Serviços

| Método   | Rota                     | Descrição                                           | Autenticação |
| :------- | :----------------------- | :-------------------------------------------------- | :----------- |
| `POST`   | `/servico/create`        | Cria um novo serviço (requer `is_prestador: true`). | `🔒`         |
| `GET`    | `/servico/:id`           | Busca os detalhes de um serviço específico.         | Pública      |
| `PATCH`  | `/servico/atualizar/:id` | Edita um serviço próprio.                           | `🔒`         |
| `DELETE` | `/servico/excluir/:id`   | Deleta um serviço próprio.                          | `🔒`         |

---

#### `POST /servico/create` 🔒

- **Cenário de Uso:** No dashboard do prestador, quando ele clica em "Adicionar Novo Serviço" para expandir seu portfólio.
- **Corpo:** `multipart/form-data`.
- **Campos:** `titulo`, `descricao`, `categoria`, `preco` (opcional), `imagens_servico` (array de arquivos, opcional).

---

## 3. Módulo de Registro de Serviço (O Coração da Confiança)

| Método  | Rota                              | Descrição                                       | Autenticação |
| :------ | :-------------------------------- | :---------------------------------------------- | :----------- |
| `POST`  | `/registro-servico/solicitar`     | Prestador solicita a confirmação de um serviço. | `🔒`         |
| `PATCH` | `/registro-servico/:id/responder` | Cliente responde a uma solicitação.             | `🔒`         |

---

#### `POST /registro-servico/solicitar` 🔒

- **Cenário de Uso:** Após concluir um serviço, o prestador acessa seu dashboard, busca o cliente para quem trabalhou e clica em "Solicitar Confirmação" para iniciar o "Aperto de Mão Digital".
- **Corpo (JSON):** `{ "clienteId": 123 }` (ID do cliente para quem o serviço foi feito).
- **Exemplo `curl`:**
  ```bash
  curl -X POST http://localhost:3000/registro-servico/solicitar \
  -H "Authorization: Bearer <TOKEN_DO_PRESTADOR>" \
  -H "Content-Type: application/json" \
  -d '{"clienteId": 2}'
  ```

### `PATCH /registro-servico/:id/responder` 🔒

- **Descrição:** Um cliente responde a uma solicitação (confirma ou recusa).
- **Autenticação:** Requerida (pelo cliente que recebeu a solicitação).
- **Parâmetro de URL:** `:id` do `RegistroServico`.
- **Corpo (JSON):** `{ "resposta": "CONCLUIDO" }` ou `{ "resposta": "RECUSADO" }`.
- **Exemplo `curl`:**
  ```bash
  curl -X PATCH http://localhost:3000/registro-servico/1/responder \
  -H "Authorization: Bearer SEU_TOKEN_DE_CLIENTE" \
  -H "Content-Type: application/json" \
  -d '{"resposta": "CONCLUIDO"}'
  ```

---

## 4. Módulo de Avaliação

Prefixo da rota: `/avaliacao`

### `POST /avaliacao/create` 🔒

- **Descrição:** Cria uma nova avaliação para um serviço concluído.
- **Autenticação:** Requerida (pelo cliente).
- **Corpo (JSON):** `{ "registroId": 1, "nota": 5, "comentario": "Ótimo serviço!" }`.
- **Exemplo `curl`:**
  ```bash
  curl -X POST http://localhost:3000/avaliacao/create \
  -H "Authorization: Bearer SEU_TOKEN_DE_CLIENTE" \
  -H "Content-Type: application/json" \
  -d '{"registroId": 1, "nota": 5, "comentario": "Serviço excelente!"}'
  ```

### `PATCH /avaliacao/:id` 🔒

- **Descrição:** Edita uma avaliação feita pelo cliente logado.
- **Autenticação:** Requerida (pelo cliente que fez a avaliação).
- **Parâmetro de URL:** `:id` da `Avaliacao`.
- **Corpo (JSON):** `{ "nota": 4, "comentario": "Serviço muito bom, mas atrasou um pouco." }`.

### `DELETE /avaliacao/:id` 🔒

- **Descrição:** Deleta uma avaliação feita pelo cliente logado.
- **Autenticação:** Requerida (pelo cliente que fez a avaliação).
- **Parâmetro de URL:** `:id` da `Avaliacao`.
