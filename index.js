const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const Database = require('./database')
const generatePdf = require('./src/certs.js')

const database = new Database('cvd.db')
database.createTable()

const input_vars = [
  {question: 'Votre prénom?', command: 'modifierPrenom', field_name: "first_name"},
  {question: 'Votre nom?', command: 'modifierNom', field_name: "last_name"},
  {question: 'Date de naissance (au format jj/mm/aaaa)?',command: 'modifierDate', field_name: "date_of_birth"},
  {question: 'Lieu de naissance?', command: 'modifierLieuDeNaissance', field_name: "place_of_birth"},
  {question: 'Adresse (Numero et Rue)?', command: 'modifierAdresse', field_name: "address"},
  {question: 'Ville?', command: 'modifierVille', field_name: "city"},
  {question: 'Code Postal?', command: 'modifierCodePostal', field_name: "code_postal"},
]

const keyboard = Markup.inlineKeyboard([
  Markup.callbackButton('Delete', 'delete')
])

function fill_missing(ctx){
  database.getUser(ctx.message.from.id, function(user){
    for (let i = 0; i < input_vars.length; i++) {
      if (user[input_vars[i].field_name] === null) {
        ctx.reply(input_vars[i].question,Extra.markup(force_reply_markup))
        break;
      }
    }
    ctx.reply("Profil complet.\nEnvoyer /genererAttestation ou tapez dessus.")
  });
}

const bot_logger = new Telegraf(process.env.BOT_LOG_TOKEN)

function  inform(message){
  bot_logger.telegram.sendMessage(process.env.BOT_LOG_USER, "COVID-BOT " + message)
}

async function get_cert(ctx, reason){
  database.getUser(ctx.from.id, async function(user){
    let i = 0;
    for (i = 0; i < input_vars.length; i++) {
      if (user[input_vars[i].field_name] === null) {
        ctx.reply(input_vars[i].question,Extra.markup(force_reply_markup))
        break;
      }
    }
    if (i === input_vars.length){
      const deplacement_date = new Date().toLocaleDateString('fr-FR')
      const deplacement_time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')
      const profile = {
        lastname: user.last_name,
        firstname: user.first_name,
        birthday: user.date_of_birth,
        lieunaissance: user.place_of_birth,
        address: user.address,
        zipcode:user.code_postal,
        town: user.city,
        datesortie: deplacement_date,
        heuresortie: deplacement_time
      }
      file = await generatePdf(profile, reason)
      pdf = Buffer.from(file);
      const creationDate = new Date().toLocaleDateString('fr-FR')
      const creationHour = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', '-')
      inform('new cert')
      ctx.replyWithDocument({ source: pdf , filename: `attestation-${creationDate}-${creationHour}.pdf` }, Extra.markup(keyboard))
      ctx.deleteMessage()
    }
  });
}

function get_user(ctx){
  database.getUser(ctx.message.from.id, function(user){
    message = 'Votre prénom : ' + user.first_name + '\n' +
    'Votre nom : ' + user.last_name + '\n' +
    'Date de naissance : ' + user.date_of_birth + '\n' +
    'Lieu de naissance : ' + user.place_of_birth + '\n' +
    'Adresse (Numero et Rue) : ' + user.address + '\n';
    'Ville : '+ user.city + '\n' +
    'Code Postal : ' + user.code_postal + '\n' +

    ctx.reply(message)
  }
  );
}

function add_user(ctx){
  inform('new user')
  database.insertUser(ctx.message.from.id, function(){
    ctx.reply("Bienvenue, veuillez remplir tous les détails pour générer les certificats.")
    fill_missing(ctx)
  });
}

function update_info(user_id, value, field_name, reply_callback){
   database.updateUser(user_id, value, field_name, function(result){reply_callback(result);});
}

function reponse_handler(ctx){
  if (ctx.message.reply_to_message){
    const question = ctx.message.reply_to_message.text;
    const result = input_vars.find(input_var => input_var.question === question);
    if (result){
      update_info(ctx.message.from.id, ctx.message.text, result.field_name, ctx.reply)
    } else {
      console.log("Q N F")
    }
    fill_missing(ctx)
  }
  else
  {
    ctx.reply(help_message);
  }
}

const force_reply_markup = Markup.forceReply(true);

const reasons = [{action: 'travail', label: 'Travail'},
                  {action: 'courses', label: 'Courses'},
                  {action: 'sante', label: 'Sante'},
                  {action: 'famille', label: 'Famille'},
                  {action: 'sport', label: 'Sport'},
                  {action: 'judiciaire', label: 'Judiciaire'},
                  {action: 'missions', label: 'Missions'}, ]

const reason_keyboard_buttons = reasons.map(reason => { return [Markup.callbackButton(reason.label, reason.action)]})
const reason_keyboard = Markup.inlineKeyboard(reason_keyboard_buttons)

let edit_commands = input_vars.map(input_var => { return '\n/' + input_var.command})

let help_message = 'Les commandes disponibles\n\nModifier le profil:\n' + edit_commands + '\n\n'
help_message = help_message + '/genererAttestation pour générer un certificat pour l\'heure actuelle\n'
help_message = help_message + '/verifier Pour vérifier votre profil\n'
help_message = help_message + '/help Pour trouver toutes ces commandes\n'



const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start((ctx) => add_user(ctx))
bot.help((ctx) => ctx.reply(help_message))
bot.command('verifier', (ctx) => get_user(ctx))
bot.command('genererAttestation', (ctx) => ctx.reply("Choisissez le motif de sortie", Extra.markup(reason_keyboard) ))
input_vars.map(input_var => bot.command(input_var.command, (ctx) => ctx.reply(input_var.question,Extra.markup(force_reply_markup))))
bot.on('message', (ctx) => reponse_handler(ctx))
bot.action('delete', ({ deleteMessage }) => deleteMessage())
reasons.map(reason => bot.action(reason.action, (ctx) => get_cert(ctx, reason.action)))
bot.launch()
