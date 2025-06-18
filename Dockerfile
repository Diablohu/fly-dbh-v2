FROM node:lts AS runtime
WORKDIR /app

COPY . .

RUN npm install
RUN npm install -g pm2
RUN npm run build

ENV HOST=0.0.0.0
ENV PORT=8080
EXPOSE 8080
CMD ["pm2-runtime", "pm2.json"]
