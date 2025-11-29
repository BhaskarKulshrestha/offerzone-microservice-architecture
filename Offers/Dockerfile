FROM node:18-alpine

WORKDIR /app

COPY Offers/package*.json ./

RUN npm install

COPY Offers .
COPY protos /protos

EXPOSE 8002

CMD ["npm", "start"]
