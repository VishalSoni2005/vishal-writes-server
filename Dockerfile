# 1️⃣ Use lightweight Node image
FROM node:20-alpine

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy only package files first (Docker cache optimization)
COPY package*.json ./

# 4️⃣ Install dependencies (NO devDependencies)
RUN npm install --omit=dev

# 5️⃣ Copy source code
COPY . .

# 6️⃣ Expose port (Cloud Run uses PORT env internally)
EXPOSE 8080

# 7️⃣ Start app
CMD ["node", "server.js"]
