# Estágio 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Instala dependências
RUN npm install

# Gera o cliente do Prisma
COPY prisma ./prisma/
RUN npx prisma generate

# Estágio 2: Produção
FROM node:20-alpine

WORKDIR /app

# Copia apenas o necessário do estágio de build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY . .

# Cria a pasta temporária para uploads (evita erro no Multer)
RUN mkdir -p tmp

# Define a porta e o comando de produção (sem nodemon)
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
