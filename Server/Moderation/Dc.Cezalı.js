const { Client, Message, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu} = require("discord.js");
const { genEmbed } = require("../../../../Global/Init/Embed");
const {VK, DC, STREAM} = require('../../../../Global/Databases/Schemas/Punitives.Activitys');
module.exports = {
    Isim: "dccezalı",
    Komut: ["dccezali","dc-cezali","dc-cezalı","dcc"],
    Kullanim: "dccezalı <@acar/ID>",
    Aciklama: "Belirtilen üyeyi cezalandırır.",
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
    if(!ayarlar && !roller && !roller.dcCezalıRolü) return message.reply(cevaplar.notSetup)
    let aktivite = "Doğruluk mu? Cesaretlik mi?"
    if(!roller.dcSorumlusu.some(oku => message.member.roles.cache.has(oku)) && !roller.sorunÇözmeciler.some(oku => message.member.roles.cache.has(oku)) && !roller.üstYönetimRolleri.some(oku => message.member.roles.cache.has(oku)) && !roller.kurucuRolleri.some(oku => message.member.roles.cache.has(oku)) && !roller.yönetimRolleri.some(oku => message.member.roles.cache.has(oku))  && !message.member.permissions.has('ADMINISTRATOR')) return message.reply(cevaplar.noyt).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    let uye = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    if(!uye) return message.reply(cevaplar.üye).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    if(uye.user.bot) return message.reply(cevaplar.bot).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    if(message.author.id === uye.id) return message.reply(cevaplar.kendi).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    if(!uye.manageable) return message.reply(cevaplar.dokunulmaz).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    if(message.member.roles.highest.position <= uye.roles.highest.position) return message.reply(cevaplar.yetkiust).then(s => setTimeout(() => s.delete().catch(err => {}), 5000));
    const sebeps = [
        { label: "Kışkırtma, Trol ve Dalgacı Davranış", description: "3 Gün", emoji: {name: "1️⃣"} , value: "1", date: "3d", type: 11},
        { label: "Karşı Cinse Taciz Ve Rahatsız Edici Davranış", description: "7 Gün", emoji: {name: "2️⃣"} ,value: "2", date: "7d", type: 11},
        { label: `Ortamı (${ayarlar.serverName}) Kötülemek`, description: "5 Gün", emoji: {name: "3️⃣"} ,value: "3", date: "5d", type: 11},
        { label: "Küfür, Argo, Hakaret ve Rahatsız Edici Davranış", description: "1 Gün", emoji: {name: "4️⃣"} ,value: "4", date: "1d", type: 11},
        { label: "Dini, Irki ve Siyasi değerlere Hakaret", description: "10 Gün", emoji: {name: "5️⃣"} ,value: "5", date: "10d", type: 11},
        { label: "Etkinliği Sabote Edicek Şekilde Davranmak", description: "3 Gün", emoji: {name: "6️⃣"}, value: "6", date: "3d", type: 11},
    ]
    let jailButton = new MessageButton()
    .setCustomId(`onayla`)
    .setLabel(await DC.findById(uye.id) ? `Aktif Cezalandırılması Mevcut!` : 'Cezalandırmayı Onaylıyorum!')
    .setEmoji(message.guild.emojiGöster(emojiler.Cezalandırıldı))
    .setStyle('SECONDARY')
    .setDisabled(await DC.findById(uye.id) ? true : false )
    let iptalButton =  new MessageButton()
    .setCustomId(`iptal`)
    .setLabel('İşlemi İptal Et')
    .setEmoji(message.guild.emojiGöster(emojiler.Iptal))
    .setStyle('DANGER')
    let jailOptions = new MessageActionRow().addComponents(
            jailButton,
            iptalButton
    );

    let msg = await message.reply({embeds: [new genEmbed().setAuthor(uye.user.tag, uye.user.displayAvatarURL({dynamic: true})).setDescription(`Belirtilen ${uye} isimli üyeyi **${aktivite}** etkinliğinden cezalandırmak istiyor musun?`)], components: [jailOptions]}).catch(err => {})

    const filter = i => i.user.id == message.member.id 
    const collector = msg.createMessageComponentCollector({ filter,  errors: ["time"], max: 3, time: 30000 })

    collector.on('collect', async i => {
        if (i.customId === `onayla`) {
            i.update({embeds: [new genEmbed().setAuthor(uye.user.tag, uye.user.displayAvatarURL({dynamic: true})).setDescription(`Belirlenen ${uye} isimli üyesini hangi sebep ile **${aktivite}** etkinliğinden cezalandırmak istiyorsun?`)], components: [new MessageActionRow().addComponents(
                new MessageSelectMenu()
                .setCustomId(`sebep`)
                .setPlaceholder(`${uye.user.tag} için ceza sebebi belirtin!`)
                .addOptions([
                    sebeps.filter(x => x.type == 11)
                ]),
            )]})
            }
        if (i.customId === `sebep`) {
           let seçilenSebep = sebeps.find(x => x.value == i.values[0])
           if(seçilenSebep) {
                i.deferUpdate()  
                msg.delete().catch(err => {})
                message.react(message.guild.emojiGöster(emojiler.Onay) ? message.guild.emojiGöster(emojiler.Onay).id : undefined).catch(err => {})
                return uye.addPunitives(seçilenSebep.type, message.member, seçilenSebep.label, message, seçilenSebep.date)
        } else {
               return i.update({components: [], embeds: [ new genEmbed().setDescription(`${message.guild.emojiGöster(emojiler.Iptal)} İşlem sırasında hata oluştu lütfen bot sahibine başvurun.`)]})
           }
         }
        if (i.customId === `iptal`) {
            msg.delete().catch(err => {})
            return await i.update({ content: `${message.guild.emojiGöster(emojiler.Iptal)} ${uye} isimli üyenin **${aktivite}** etkinliğinden cezalandırılma işlemi başarıyla iptal edildi.`, components: [], embeds: [] , ephemeral: true});
        }
    });
    collector.on("end", async i => {
        msg.delete().catch(err => {})
    })

    }
};

