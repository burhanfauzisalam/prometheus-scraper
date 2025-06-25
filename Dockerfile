# Gunakan image Node.js resmi
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Salin file package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua file (termasuk folder src)
COPY . .

# Jalankan file utama dari folder src
CMD ["node", "app.js"]
