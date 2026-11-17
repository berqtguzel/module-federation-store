FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_FAKE_STORE_API_URL=https://fakestoreapi.com
ENV NEXT_PUBLIC_FAKE_STORE_API_URL=${NEXT_PUBLIC_FAKE_STORE_API_URL}

RUN npm run build

FROM node:24-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/next.config.js ./next.config.js

USER node
EXPOSE 3101

CMD ["npm", "start"]
