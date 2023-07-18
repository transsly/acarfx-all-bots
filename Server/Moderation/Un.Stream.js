const { Client, Message, MessageEmbed} = require("discord.js");
const Punitives = require('../../../../Global/Databases/Schemas/Global.Punitives');
const {VK, DC, STREAM} = require('../../../../Global/Databases/Schemas/Punitives.Activitys');
const { genEmbed } = require("../../../../Global/Init/Embed");
module.exports = {
    Isim: "stream-kaldır",
    Komut: ["stream-kaldir", "streamkaldir","streamkaldır","streamcezalı-kaldır","streamcezalıkaldır","streamcezalikaldir","unstream","unstreamer"],
    Kullanim: "unstream <#No/@acar/ID>",
    Aciklama: "Belirlenen üyenin metin kanallarındaki susturmasını kaldırır.",
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

    let aktivite = "**Stream**"
    if(!roller.streamerSorumlusu.some(oku => message.member.roles.cache.has(oku)) && !roller.sorunÇözmeciler.some(oku => message.member.roles.cache.has(oku)) && !roller.üstYönetimRolleri.some(oku => message.member.roles.cache.has(oku)) && !roller.kurucuRolleri.some(oku => message.member.roles.cache.has(oku)) && !roller.yönetimRolleri.some(oku => message.member.roles.cache.has(oku))  && !message.member.permissions.has('ADMINISTRATOR')) return message.reply(cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    if(Number(args[0])) {
        let cezanobul = await STREAM.findOne({No: args[0]})
        if(cezanobul) args[0] = cezanobul._id
    }
    let uye = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    if(!uye) return message.reply(cevaplar.üye).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    if(uye.user.bot) return message.reply(cevaplar.bot).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    if(message.author.id === uye.id) return message.reply(cevaplar.kendi).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    if(!uye.manageable) return message.reply(cevaplar.dokunulmaz).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    if(message.member.roles.highest.position <= uye.roles.highest.position) return message.reply(cevaplar.yetkiust).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    let cezakontrol = await STREAM.findById(uye.id) 
    if(!cezakontrol) {
        message.channel.send(cevaplar.cezayok);
        message.react(message.guild.emojiGöster(emojiler.Iptal) ? message.guild.emojiGöster(emojiler.Iptal).id : undefined)
        return;
    };  
    let cezabilgisi = await Punitives.findOne({ Member: uye.id, Active: true, Type: "Streamer Cezalandırma" }) 
    if(cezabilgisi && cezabilgisi.Staff !== message.author.id && message.guild.members.cache.get(cezabilgisi.Staff) && !message.member.permissions.has("ADMINISTRATOR") && (roller.sorunÇözmeciler && !roller.sorunÇözmeciler.some(x => message.member.roles.cache.has(x))) && !roller.kurucuRolleri.some(x => message.member.roles.cache.has(x))) 
    return message.channel.send({embeds: [new genEmbed().setDescription(`${cevaplar.prefix} Bu ceza ${cezabilgisi.Staff ? message.guild.members.cache.get(cezabilgisi.Staff) ? `${message.guild.members.cache.get(cezabilgisi.Staff)} (\`${cezabilgisi.Staff}\`)` : `${cezabilgisi.Staff}` :  `${cezabilgisi.Staff}`} Tarafından cezalandırılmış. **Bu Cezayı Açman Münkün Değil!**`).setFooter("yaptırım yapılan cezada yaptırımı yapan yetkili işlem uygulayabilir.")]}).then(x => {
        message.react(message.guild.emojiGöster(emojiler.Iptal) ? message.guild.emojiGöster(emojiler.Iptal).id : undefined)
        setTimeout(() => {
            x.delete()
        }, 7500);
    });
    await Punitives.updateOne({ No: cezakontrol.No }, { $set: { "Active": false, Expried: Date.now(), Remover: message.member.id} }, { upsert: true })
    if(await STREAM.findById(uye.id)) {
        await STREAM.findByIdAndDelete(uye.id)
    }
    if(uye && uye.manageable) await uye.roles.remove(roller.streamerCezalıRolü).catch(err => {});;
    await message.reply(`${message.guild.emojiGöster(emojiler.Onay)} Başarıyla ${uye} üyesinin (\`#${cezakontrol.No}\`) ceza numaralı ${aktivite} cezası kaldırıldı!`).then(x => {setTimeout(() => {
        x.delete()
    }, 10500)});;
    if(uye) uye.send({embeds: [ new genEmbed().setDescription(`${message.author} tarafından <t:${String(Date.now()).slice(0, 10)}:R> \`#${cezakontrol.No}\` ceza numaralı ${aktivite} cezası kaldırıldı.`)]}).catch(x => {
        
    });
    message.react(message.guild.emojiGöster(emojiler.Onay) ? message.guild.emojiGöster(emojiler.Onay).id : undefined)
    }
};