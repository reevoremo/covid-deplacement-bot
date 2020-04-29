# covid-deplacement-bot

## How to install

```console
$ git clone git@github.com:reevoremo/covid-deplacement-bot.git
$ cd covid-deplacement-bot
$ npm i
```
## Running the application

[Create a telegram bot](https://core.telegram.org/bots#3-how-do-i-create-a-bot) and get the bot token.

### Developement

Environment variables:
BOT_TOKEN=<your bot token given by telegram>
BOT_LOG_TOKEN=<bot token> # You can use the same, it informs when /start command is used and when cert is generated
BOT_LOG_USER=<telegram user id> #Give your ID so you can get the 'new user' or 'new cert' alerts

Then run the application
```console
$ node index.js
```
### Production

Run a docker container in a server
```console
$ docker-compose up -d --build
```
#### Requirements

- docker and docker-compose

Make sure docker has permission to access these directories. You can change the mount location or the permissions to run the application.

Volume for environment variables
- /credentials/covid-bot/env_file Add the environment variables to this file.

Volume mounted to persist the data
- /opt/covid-bot/data:/opt/services/node/src/database

# Crédits

The original creator of the certificate generator:
[covid-19-certificate](https://github.com/nesk/covid-19-certificate) [Johann Pardanaud](https://github.com/nesk).


The following open source projects were used for the development of this service:

- [PDF-LIB](https://pdf-lib.js.org/)
- [qrcode](https://github.com/soldair/node-qrcode)
