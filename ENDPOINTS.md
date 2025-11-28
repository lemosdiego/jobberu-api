# Guia de Endpoints da API Jobberu

Este documento serve como referência para todos os endpoints disponíveis na API, como testá-los e quais dados são esperados.

**Ferramentas Recomendadas:** [Postman](https://www.postman.com/), [Insomnia](https://insomnia.rest/) ou `curl`.

**Autenticação:** Endpoints marcados com `🔒` requerem um Token de Autenticação. Para obtê-lo, faça login via `POST /usuario/login`. O token deve ser enviado no cabeçalho `Authorization` no formato `Bearer SEU_TOKEN`.

---

## 1. Módulo de Usuários

Prefixo da rota: `/usuario`

### `POST /usuario/create`

- **Descrição:** Cria um novo usuário (cliente ou prestador).
- **Autenticação:** Não requerida.
- **Tipo de Corpo:** `multipart/form-data` (devido ao upload de imagem).
- **Campos Comuns:** `nome`, `email`, `senha`, `telefone`, `is_prestador` (booleano `true` ou `false`), `cep`, `cidade`, `estado`, `foto_perfil` (arquivo de imagem, opcional).
- **Campos para Prestadores (`is_prestador: true`):** `titulo_profissional`, `biografia`, `anos_experiencia`, `links_redes_sociais`.
- **Exemplo `curl`:**
  ```bash
  curl -X POST http://localhost:3000/usuario/create \
  -F "nome=João da Silva" \
  -F "email=joao@email.com" \
  -F "senha=senha123" \
  -F "is_prestador=false" \
  -F "foto_perfil=@/caminho/para/sua/foto.jpg"
  ```

### `POST /usuario/login`

- **Descrição:** Autentica um usuário e retorna um token JWT.
- **Autenticação:** Não requerida.
- **Corpo (JSON):** `{ "email": "seu-email@email.com", "senha": "sua-senha" }`
- **Exemplo `curl`:**
  ```bash
  curl -X POST http://localhost:3000/usuario/login \
  -H "Content-Type: application/json" \
  -d '{"email": "joao@email.com", "senha": "senha123"}'
  ```

### `GET /usuario`

- **Descrição:** Lista todos os usuários cadastrados.
- **Autenticação:** Não requerida.

### `GET /usuario/:id`

- **Descrição:** Busca um usuário prestador específico pelo ID.
- **Autenticação:** Não requerida.

### `GET /usuario/me/avaliacoes` 🔒

- **Descrição:** Lista todas as avaliações feitas pelo usuário logado.
- **Autenticação:** Requerida.

### `GET /usuario/:id/servicos`

- **Descrição:** Lista todos os serviços oferecidos por um prestador específico.
- **Autenticação:** Não requerida.

### `PATCH /usuario/atualizar/:id` 🔒

- **Descrição:** Atualiza os dados do próprio perfil.
- **Autenticação:** Requerida.
- **Tipo de Corpo:** `multipart/form-data`.

### `DELETE /usuario/excluir/:id` 🔒

- **Descrição:** Deleta o próprio perfil.
- **Autenticação:** Requerida.

---

## 2. Módulo de Serviços

Prefixo da rota: `/servico`

### `POST /servico/create` 🔒

- **Descrição:** Cria um novo serviço (apenas para prestadores).
- **Autenticação:** Requerida (usuário deve ser `is_prestador: true`).
- **Tipo de Corpo:** `multipart/form-data`.
- **Campos:** `titulo`, `descricao`, `categoria`, `preco`, `imagens_servico` (arquivos de imagem).

### `GET /servico`

- **Descrição:** Lista todos os serviços disponíveis.
- **Autenticação:** Não requerida.

### `GET /servico/:id`

- **Descrição:** Busca um serviço específico pelo ID.
- **Autenticação:** Não requerida.

### `PATCH /servico/atualizar/:id` 🔒

- **Descrição:** Edita um serviço que pertence ao prestador logado.
- **Autenticação:** Requerida.
- **Corpo (JSON):** `{ "titulo": "Novo Título", "preco": 150.00 }`

### `DELETE /servico/excluir/:id` 🔒

- **Descrição:** Deleta um serviço que pertence ao prestador logado.
- **Autenticação:** Requerida.

---

## 3. Módulo de Registro de Serviço

Prefixo da rota: `/registro-servico`

### `POST /registro-servico/solicitar` 🔒

- **Descrição:** Um prestador solicita a confirmação de um serviço a um cliente.
- **Autenticação:** Requerida (usuário deve ser `is_prestador: true`).
- **Corpo (JSON):** `{ "clienteId": 123 }` (ID do cliente para quem o serviço foi feito).
- **Exemplo `curl`:**
  ```bash
  curl -X POST http://localhost:3000/registro-servico/solicitar \
  -H "Authorization: Bearer SEU_TOKEN_DE_PRESTADOR" \
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
