FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG PRODUCTS_REMOTE_URL=http://localhost:3101
ARG BASKET_REMOTE_URL=http://localhost:3102
ENV PRODUCTS_REMOTE_URL=${PRODUCTS_REMOTE_URL}
ENV BASKET_REMOTE_URL=${BASKET_REMOTE_URL}

RUN npm run build

FROM node:24-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/next.config.js ./next.config.js

USER node
EXPOSE 3100

CMD ["npm", "start"]
