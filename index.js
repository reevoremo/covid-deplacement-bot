const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const Database = require('./database')

database = new Database('cvd.db')
database.createTable()

const input_vars = ['Prénom', 'Nom', 'Date de naissance (au format jj/mm/aaaa)', 'Lieu de naissance', 'Ville', 'Code Postal', 'Adresse']
const keyboard = Markup.inlineKeyboard([
  Markup.urlButton('❤️', 'http://telegraf.js.org'),
  Markup.callbackButton('Delete', 'delete')
])

const help_message = 'HELP\n\nEdit firstname: /editFirstName\nEdit lastname: /editLastName\n'

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start((ctx) => ctx.reply('Hello, setup your profile'))
bot.help((ctx) => ctx.reply(help_message))
bot.command('editFirstName', (ctx) => ctx.reply("YES"))
bot.on('message', (ctx) => ctx.telegram.sendCopy(ctx.chat.id, ctx.message, Extra.markup(keyboard)))
bot.action('delete', ({ deleteMessage }) => deleteMessage())
bot.launch()
