# Web image: builds the React app, then serves it (plus the DJ message socket) with backend/server.js

# ---- Build the React app ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY tsconfig.json ./
COPY public ./public
COPY src ./src

# CRA inlines REACT_APP_* variables at build time, so they are passed in as build args.
# The backend URLs are same-origin paths that the reverse proxy routes (see deploy/Caddyfile).
ARG REACT_APP_API_URL=/api
ARG REACT_APP_WEB_URL=/
ARG REACT_APP_FIREBASE_API_KEY
ARG REACT_APP_FIREBASE_AUTH_DOMAIN
ARG REACT_APP_FIREBASE_PROJECT_ID
ARG REACT_APP_FIREBASE_STORAGE_BUCKET
ARG REACT_APP_FIREBASE_MESSAGING_SENDER_ID
ARG REACT_APP_FIREBASE_APP_ID
ARG REACT_APP_FIREBASE_MEASUREMENT_ID
RUN npm run build

# ---- Runtime: Node server ----
FROM node:22-alpine
ENV NODE_ENV=production \
    PORT=5000 \
    START_PYTHON_API=false
WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY backend/server.js ./
# server.js serves ../build
COPY --from=build /app/build /app/build

USER node
EXPOSE 5000
CMD ["node", "server.js"]
