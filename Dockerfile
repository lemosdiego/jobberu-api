FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY . .



RUN DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public" npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
