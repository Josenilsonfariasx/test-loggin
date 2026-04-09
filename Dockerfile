FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE $PORT

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD sh -c "wget -qO- http://localhost:${PORT}/health || exit 1"

CMD ["node", "src/app.js"]
