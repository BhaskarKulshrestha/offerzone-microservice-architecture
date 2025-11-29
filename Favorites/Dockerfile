FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8004
# you will override port with env or in compose, but exposing 8000 is fine
CMD ["node", "index.js"]