FROM node:lts as dependencies
WORKDIR /dapp
COPY package.json package-lock.json ./
RUN npm install --production

FROM node:lts as builder
WORKDIR /dapp
COPY . .
COPY --from=dependencies /dapp/node_modules ./node_modules
RUN npm build

FROM node:lts as runner
WORKDIR /dapp
ENV NODE_ENV production
# If you are using a custom next.config.js file, uncomment this line.
# COPY --from=builder /dapp/next.config.js ./
COPY --from=builder /dapp/public ./public
COPY --from=builder /dapp/components ./components
COPY --from=builder /dapp/contracts ./contracts
COPY --from=builder /dapp/.next ./.next
COPY --from=builder /dapp/node_modules ./node_modules
COPY --from=builder /dapp/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]