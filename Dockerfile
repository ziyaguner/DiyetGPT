# Aşama 1: Frontend'i build et
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Aşama 2: Backend ve Production Server
FROM node:20-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# Frontend build çıktısını kopyala
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Veritabanı ve upload dosyaları için gerekli klasörleri oluştur
RUN mkdir -p /app/backend/data && mkdir -p /app/backend/uploads
# Veritabanı yolunun çevresel değişkenden alınması yerine
# doğrudan volume ile bağlanan /app/backend/data içine gitmesi için server.js'yi güncelleyeceğiz veya volume olarak burayı map edeceğiz.

EXPOSE 5000
CMD ["npm", "start"]
