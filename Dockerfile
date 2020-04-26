FROM node:12.16.2

# Create app directory
WORKDIR /opt/services/node/src

COPY package*.json /opt/services/node/src/

RUN npm install

COPY . /opt/services/node/src/

CMD [ "node", "index.js" ]
