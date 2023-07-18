const { Client, Message, MessageActionRow, MessageButton} = Discord = require("discord.js");
const Punitives = require('../../../../Global/Databases/Schemas/Global.Punitives');
const Kalkmaz = require('../../../../Global/Databases/Schemas/Punitives.Forcebans');
const Users = require('../../../../Global/Databases/Schemas/Client.Users');
const { genEmbed } = require('../../../../Global/Init/Embed');
const getLimit = new Map();

module.exports = {
    Isim: "banlist",
    Komut: ["banlistesi","yasaklamalar","ban-list"],
    Kullanim: "yasaklamalar",
    Aciklama: "Belirlenen üyeyi sunucudan uzaklaştırır.",
    Kategori: "yetkili",
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
    if(!ayarlar && !roller && !roller.banHammer || !roller.üstYönetimRolleri || !roller.yönetimRolleri || !roller.kurucuRolleri || !roller.altYönetimRolleri) return message.reply(cevaplar.notSetup)
    if(!roller.banHammer.some(oku => message.member.roles.cache.has(oku)) && !roller.kurucuRolleri.some(oku => message.member.roles.cache.has(oku)) && !message.member.permissions.has('ADMINISTRATOR')) return message.reply(cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    let toplamBan = 0
    await message.guild.bans.fetch().then(async (banned) => {
        toplamBan = banned.size
    })
    let buttons = [
        new MessageButton()
        .setCustomId("bans")
        .setLabel(toplamBan > 0 ? "⛔ Yasaklama" : "🔓 Yasaklama")
        .setDisabled(toplamBan > 0 ? false : true)
        .setStyle(toplamBan > 0 ? "PRIMARY" : "SECONDARY"),
    ]
    let kalkmazYasaklama = await Kalkmaz.find()
    let forceBanList = '';
    if(kalkmazYasaklama) {
        buttons.push([
            new MessageButton()
            .setCustomId("forcebans")
            .setLabel(toplamBan > 0 ? "📛 Kalkmaz Yasaklama" : "🔓 Kalkmaz Yasaklama")
            .setDisabled(toplamBan > 0 ? false : true)
            .setStyle(toplamBan > 0 ? "PRIMARY" : "SECONDARY"),
        ]) 
        kalkmazYasaklama.forEach(async (uye) => {
            let hesap = await client.getUser(uye._id)
            forceBanList += `#${uye.No} | ${hesap.tag} (${hesap.id})\n`
        })
       
    }
    let Row = new MessageActionRow().addComponents(
        [buttons]
    )
    let banList = '';
    if(toplamBan > 0) await message.guild.bans.fetch().then(async (banned) => {
         banned.forEach(async (user) => {
            let cezaBul = await Punitives.findOne({Member: user.user.id, Type: "Yasaklama"})
            banList += `${cezaBul ? `#${cezaBul.No} |` : "Sağ-Tık |"} ${user.user.tag} (${user.user.id})\n`
        })
    })
    await message.reply({content: `:tada: Aşağı da \`${message.guild.name}\` sunucusuna ait kalkmaz yasaklama ve yasaklamalar listelenmektedir.`, components: [Row]}).then(async (msg) => {
        message.react(message.guild.emojiGöster(emojiler.Onay) ? message.guild.emojiGöster(emojiler.Onay).id : undefined).catch(err => {})
        const filter = i => i.user.id == message.member.id 
        const collector = msg.createMessageComponentCollector({ filter,  errors: ["time"], time: 60000 })
        collector.on("collect", async (i) => {
           if(i.customId == "bans") {
               msg.edit({content: `:x: Aşağıda \`${message.guild.name}\` sunucusuna ait yasaklı üyeler listelenmektedir (**${toplamBan}**).\n\`\`\`${banList}\`\`\``}).catch(err => {
                const arr = Discord.Util.splitMessage(banList, { maxLength: 2000, char: "\n" });
                for (const newText of arr) {
                  message.channel.send(`${newText}`)
                }
               }),i.deferUpdate().catch(err => {})
           }
           if(i.customId == "forcebans") {
               msg.edit({content: `:x: Aşağıda \`${message.guild.name}\` sunucusuna ait kalkmaz yasaklanan üyeler listelenmektedir (**${kalkmazYasaklama.length}**).\n\`\`\`${forceBanList}\`\`\``}).catch(err => {
    const arr = Discord.Util.splitMessage(forceBanList, { maxLength: 2000, char: "\n" });
    for (const newText of arr) {
      message.channel.send(`${newText}`)
    }
}),i.deferUpdate().catch(err => {})
           }
        })
        collector.on("end", i => {
            msg.delete().catch(err => {})
        })
    })
    }
};

  