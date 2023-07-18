const { Client, Message} = require("discord.js");
const cmdBans = require('../../../../Global/Databases/Schemas/Others/Users.Command.Blocks')
const { genEmbed } = require('../../../../Global/Init/Embed');
module.exports = {
    Isim: "safecmd",
    Komut: ["scmd", "scom "],
    Kullanim: "",
    Aciklama: "",
    Kategori: "-",
    Extend: true,
    
   /**
   * @param {Client} client 
   */
  onLoad: function (client) {

  },

   /**
   * @param {Client} client 
   * @param {Message} message 
   * @param {Array<String>} args 
   */

  onRequest: async function (client, message, args) {
    let uye = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    if(!uye) return message.react(message.guild.emojiGöster(emojiler.Iptal) ? message.guild.emojiGöster(emojiler.Iptal).id : undefined)
    await cmdBans.findByIdAndDelete(uye.id)
    message.react(message.guild.emojiGöster(emojiler.Onay) ? message.guild.emojiGöster(emojiler.Onay).id : undefined)
    message.channel.send({embeds: [new genEmbed().setDescription(`${message.guild.emojiGöster(emojiler.Onay)} Başarıyla ${uye} isimli üyenin \`${message.guild.name}\` sunucusunda ki komut yasağı \`${tarihsel(Date.now())}\` tarihinde kaldırıldı.`)]})
    let logLa = message.guild.kanalBul("safe-command-log")
    if(logLa) logLa.send(({embeds: [new genEmbed().setDescription(`${uye} isimli üyenin \`${message.guild.name}\` sunucusunda ki komut yasağı ${message.member} tarafından \`${tarihsel(Date.now())}\` tarihinde kaldırıldı.`)]}))
  }
};