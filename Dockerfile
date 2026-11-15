FROM node:24-alpine

ENV NODE_ENV=production
WORKDIR /app

# Install only production dependencies, exactly as pinned in package-lock.json
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . .

# Don't run as root inside the container
USER node

ENV PORT=8000
EXPOSE 8000
CMD ["node", "index.js"]