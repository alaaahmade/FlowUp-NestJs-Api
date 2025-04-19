FROM node:20-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

# Create secrets directory
RUN mkdir -p /usr/src/app/secrets

CMD ["node", "dist/main"]

# Staging stage
FROM node:20-alpine AS staging

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

# Create secrets directory
RUN mkdir -p /usr/src/app/secrets

CMD ["node", "dist/main"]

# Test stage
FROM node:20-alpine AS test

# Install git and ssh
RUN apk add --no-cache git openssh-client

# Setup SSH directory
RUN mkdir -p /root/.ssh && chmod 700 /root/.ssh

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
COPY --from=development /usr/src/app/dist ./dist

CMD ["npm", "run", "test"]