<<<<<<< Updated upstream
# 1) build your app
FROM node:18-alpine AS builder
=======
FROM node:24-bookworm AS builder
>>>>>>> Stashed changes
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

<<<<<<< Updated upstream
# 2) runtime image
FROM node:18-alpine

# — create the same user
RUN addgroup -S app \
 && adduser  -S -G app app

=======
FROM node:24-bookworm
>>>>>>> Stashed changes
WORKDIR /app

# — copy your built files, chowning them to app:app in one go
COPY --from=builder --chown=app:app /app /app

# — switch to that user
USER app

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "index.js"]
