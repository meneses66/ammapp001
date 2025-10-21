FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

ENV PORT=3000
ENV API_BASE_URL=http://localhost:5000/api

EXPOSE 3000

CMD ["npm", "start"]
