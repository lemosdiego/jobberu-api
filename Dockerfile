FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY . .

RUN npm install -g nodemon

EXPOSE 3000

CMD ["nodemon", "--legacy-watch", "src/server.js"]
