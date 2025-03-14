FROM node:20-slim

RUN apt-get update && \
    apt-get install -y \
    ffmpeg;

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 56225

CMD ["node", "."]
