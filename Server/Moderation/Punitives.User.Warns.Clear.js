const { Client, Message, MessageEmbed} = require("discord.js");
const Punitives = require('../../../../Global/Databases/Schemas/Global.Punitives');
const Users = require('../../../../Global/Databases/Schemas/Client.Users');
const { genEmbed } = require("../../../../Global/Init/Embed");
module.exports = {
    Isim: "uyarıtemizle",
    Komut: ["uyarılartemizle","uyarilartemizle"],
    Kullanim: "uyarıtemizle <@acar/ID>",
    Aciklama: "Belirtilen ceza numarasının bütün bilgilerini gösterir.",
    Kategori: "kurucu",
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
    if(!ayarlar.staff.includes(message.member.id) && !roller.kurucuRolleri.some(oku => message.member.roles.cache.has(oku))) return message.reply(cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));

    let uye = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await client.getUser(args[0])
    if(!uye) return message.reply(cevaplar.üye).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    let cezalar = await Punitives.findOne({Member: uye.id});
    if(!cezalar) return message.reply({embeds: [new genEmbed().setDescription(`${uye} isimli üyenin cezası bulunamadı.`)]});
    if(await Punitives.findOne({Member: uye.id, Type: "Uyarılma"})) {
    	await message.reply({embeds: [new genEmbed().setDescription(`${message.guild.emojiGöster(emojiler.Onay)} ${uye} üyesinin tüm uyarılmaları başarıyla temizlendi.`)]})
    	await Punitives.updateMany({Member: uye.id, Type: "Uyarılma" }, { $set: { Member: `Silindi (${uye.id})`, No: "-99999", Remover: `Sildi (${message.author.id})`} }, { upsert: true });
    	await message.react(message.guild.emojiGöster(emojiler.Onay) ? message.guild.emojiGöster(emojiler.Onay).id : undefined)
    } else { 
	await message.react(message.guild.emojiGöster(emojiler.Iptal) ? message.guild.emojiGöster(emojiler.Iptal).id : undefined)
	return message.reply({embeds: [new genEmbed().setDescription(`${uye} isimli üyenin uyarısı bulunamadığından dolayı işlem iptal edili.`)]});
    }
    }
};