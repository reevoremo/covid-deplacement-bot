FROM node:12.16.2

ENV TZ=Europe/Paris

RUN apk --update add \
   	tzdata \
   && cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
   && apk del tzdata


WORKDIR /opt/services/node/src

COPY package*.json /opt/services/node/src/

RUN npm install

COPY . /opt/services/node/src/

CMD [ "node", "index.js" ]
