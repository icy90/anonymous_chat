FROM node:6


WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .

ENV RABBITMQ_HOST=localhost

EXPOSE 3000

CMD [ "node", "." ]