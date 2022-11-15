FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build && npm prune --production

FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/node_modules node_modules/
COPY --from=build /app/lib lib/

CMD [ "node", "lib" ]
