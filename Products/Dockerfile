FROM node:18-alpine

WORKDIR /app

COPY Products/package*.json ./

RUN npm install

COPY Products .
COPY protos /protos

EXPOSE 8000
EXPOSE 50051

CMD ["npm", "start"]
