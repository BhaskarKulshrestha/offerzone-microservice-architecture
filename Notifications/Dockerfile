FROM node:18-alpine

WORKDIR /app

COPY Notifications/package*.json ./

RUN npm install

COPY Notifications .
COPY protos /protos

EXPOSE 8003

CMD ["npm", "start"]
