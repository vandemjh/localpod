FROM node:20-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    chromium;

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 56225

CMD ["node", "."]
