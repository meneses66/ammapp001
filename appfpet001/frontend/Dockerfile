FROM node:20-alpine

WORKDIR /usr/src/app

COPY appfpet001/frontend/package*.json ./

RUN npm install --production

COPY appfpet001/frontend/ ./

ENV PORT=3000
ENV API_BASE_URL=http://localhost:5000/api

EXPOSE 3000

CMD ["npm", "start"]
