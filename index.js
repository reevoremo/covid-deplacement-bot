const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const Database = require('./database')

const database = new Database('cvd.db')
database.createTable()


function get_cert(ctx){
  user = database.getUser(ctx.message.from.id, function(user){
    message = 'Votre prénom: ' + user.first_name + '\n' +
    'Votre nom: ' + user.last_name + '\n' +
    'Date de naissance: ' + user.date_of_birth + '\n' +
    'Lieu de naissance: ' + user.place_of_birth + '\n' +
    'Ville '+ user.city + '\n' +
    'Code Postal: ' + user.code_postal + '\n' +
    'Adresse: ' + user.address + '\n';
    ctx.reply(message)
  }
  );
}

function get_user(ctx){
  user = database.getUser(ctx.message.from.id, function(user){
    message = 'Votre prénom: ' + user.first_name + '\n' +
    'Votre nom: ' + user.last_name + '\n' +
    'Date de naissance: ' + user.date_of_birth + '\n' +
    'Lieu de naissance: ' + user.place_of_birth + '\n' +
    'Ville '+ user.city + '\n' +
    'Code Postal: ' + user.code_postal + '\n' +
    'Adresse: ' + user.address + '\n';
    ctx.reply(message)
  }
  );
}

async function add_user(user_id){
  await database.insertUser(user_id);
  user = await get_user(user_id)
  return user.id;
}

function update_info(user_id, value, field_name, reply_callback){
   database.updateUser(user_id, value, field_name, function(result){reply_callback(result);});
}


const input_vars = [
  {question: 'Votre prénom?', command: 'modifierPrenom', field_name: "first_name"},
  {question: 'Votre nom?', command: 'modifierNom', field_name: "last_name"},
  {question: 'Date de naissance (au format jj/mm/aaaa)?',command: 'modifierDate', field_name: "date_of_birth"},
  {question: 'Lieu de naissance?', command: 'modifierLieuDeNaissance', field_name: "place_of_birth"},
  {question: 'Ville?', command: 'modifierVille', field_name: "city"},
  {question: 'Code Postal?', command: 'modifierCodePostal', field_name: "code_postal"},
  {question: 'Adresse?', command: 'modifierAdresse', field_name: "address"},
]


function reponse_handler(ctx){
  if (ctx.message.reply_to_message){
    const question = ctx.message.reply_to_message.text;
    const result = input_vars.find(input_var => input_var.question === question);
    if (result){
      update_info(ctx.message.from.id, ctx.message.text, result.field_name, ctx.reply)
    } else {
      console.log("Q N F")
    }
  }
  else
  {
    ctx.reply(help_message);
  }
}


const keyboard = Markup.inlineKeyboard([
  Markup.urlButton('❤️', 'http://telegraf.js.org'),
  Markup.callbackButton('Delete', 'delete')
])

const keyboard2 = Markup.forceReply(true);

const help_message = 'HELP\n\nEdit firstname: /editFirstName\nEdit lastname: /editLastName\n'

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start((ctx) => ctx.reply(add_user(ctx.message.from.id)))
bot.help((ctx) => ctx.reply(help_message))
bot.command('verifier', (ctx) => get_user(ctx))
bot.command('genererAttestation', (ctx) => get_cert(ctx))
input_vars.map(input_var => bot.command(input_var.command, (ctx) => ctx.reply(input_var.question,Extra.markup(keyboard2))))
bot.on('message', (ctx) => reponse_handler(ctx))
//bot.on('message', (ctx) => ctx.telegram.sendCopy(ctx.chat.id, ctx.message, Extra.markup(keyboard2)))
bot.action('delete', ({ deleteMessage }) => deleteMessage())
bot.launch()
