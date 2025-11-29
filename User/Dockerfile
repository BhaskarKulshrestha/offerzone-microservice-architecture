FROM node:18-alpine

WORKDIR /app

COPY User/package*.json ./

RUN npm install

COPY User .
COPY protos /protos

EXPOSE 8001
EXPOSE 50052

CMD ["npm", "start"]
