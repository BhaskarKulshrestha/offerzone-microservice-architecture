FROM node:18-alpine

WORKDIR /app

COPY ApiGateway/package*.json ./

RUN npm install

COPY ApiGateway .

EXPOSE 8085

CMD ["npm", "start"]
