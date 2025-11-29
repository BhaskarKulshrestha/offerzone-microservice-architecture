FROM node:18-alpine

WORKDIR /app

COPY Favorites/package*.json ./

RUN npm install

COPY Favorites .
COPY protos /protos

EXPOSE 8004

CMD ["npm", "start"]
