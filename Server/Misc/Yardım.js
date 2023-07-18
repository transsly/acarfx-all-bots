const { Client, Message, MessageEmbed, MessageActionRow, MessageSelectMenu} = require("discord.js");
const { genEmbed } = require("../../../../Global/Init/Embed");
const GUILDS_SETTINGS = require('../../../../Global/Databases/Schemas/Global.Guild.Settings');
module.exports = {
    Isim: "yardım",
    Komut: ["help", "yardim"],
    Kullanim: "yardım <@acar/ID>",
    Aciklama: "Belirtilen üyenin profil resmini büyültür.",
    Kategori: "Misc",
    Extend: false,
    
   /**
   * @param {Client} client 
   */
  onLoad: function (client) {
    client.on('interactionCreate', async i => {
        if (!i.isSelectMenu()) return;
        let Data = await GUILDS_SETTINGS.findOne({ _id: 1 })
        if (i.customId === 'acar_yardim') {
            if(i.values == "talent") {
                i.reply({embeds: [new genEmbed().setDescription(`${Data ?  Data.talentPerms ? Data.talentPerms.map(x => `\`${sistem.botSettings.Prefixs[0] + x.Commands + " <@acar/ID>"}\``).join("\n") : '' : ''}`)], ephemeral: true})
           } else {
                i.reply({embeds: [new genEmbed().setDescription(`${client.commands.filter(x => x.Extend != false && x.Kategori == `${i.values}` && (ayarlar.dugmeliKayit ? x.Isim != "erkek" : true)).map(x => `\`${sistem.botSettings.Prefixs[0] + (ayarlar.dugmeliKayit ? x.Kullanim.replace("kadın", "kayıt") : x.Kullanim)}\``).join("\n")}`)], ephemeral: true})
           }
        }
    });
  },

   /**
   * @param {Client} client 
   * @param {Message} message 
   * @param {Array<String>} args 
   */

  onRequest: async function (client, message, args) {
    let embed = new genEmbed()
    let Data = await GUILDS_SETTINGS.findOne({ _id: 1 })
    let Row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
        .setCustomId("yardimmenusu")
        .setPlaceholder("Yardım kategorisini listeden seçin!")
        .setOptions(
            {label: "Üye Komutları", description: "Genel tüm komutları içerir.", value: "diğer"},
            {label: "Ekonomi Komutları", description: "Genel tüm ekonomi komutlarını içerir.", value: "eco"},
            {label: "İstatistik Komutları", description: "Genel tüm stat komutlarını içerir.", value: "stat"},
            {label: "Teyit Komutları", description: "Genel tüm kayıt komutlarını içerir.", value: "teyit"},
            {label: "Yetkili Komutları", description: "Genel tüm yetkili komutlarını içerir.", value: "yetkili"},
            {label: "Yetenek ve Diğer Komutlar", description: "Genel tüm yetenek ve diğer komutlar içerir.", value: "talent"},
            {label: "Yönetim Komutları", description: "Genel tüm yönetim komutlarını içerir.", value: "yönetim"},
            {label: "Kurucu Komutları", description: "Genel tüm kurucu komutlarını içerir.", value: "kurucu"}
        )
    )



    const acar = await message.reply({components: [Row] ,embeds: [new genEmbed().setDescription(`:tada: Aşağıdaki kategorilerden komut yardımı almak istediğiniz kategoriyi seçin!`)]})
    var filter = i => i.user.id == message.member.id
    let collector = acar.createMessageComponentCollector({filter: filter, time: 60000, error: ["time"]})
    
    collector.on("collect", i => {
        if(i.customId == "yardimmenusu") {
           if(i.values == "talent") {
                acar.edit({embeds: [new genEmbed().setDescription(`${Data ?  Data.talentPerms ? Data.talentPerms.map(x => `\`${sistem.botSettings.Prefixs[0] + x.Commands + " <@acar/ID>"}\``).join("\n") : '' : ''}`)]})
           } else {
                acar.edit({embeds: [new genEmbed().setDescription(`${client.commands.filter(x => x.Extend != false && x.Kategori == `${i.values}` && (ayarlar.dugmeliKayit ? x.Isim != "erkek" : true)).map(x => `\`${sistem.botSettings.Prefixs[0] + (ayarlar.dugmeliKayit ? x.Kullanim.replace("kadın", "kayıt") : x.Kullanim)}\``).join("\n")}`)]})
           }
           i.deferUpdate()
        }
    })
    collector.on("end", () => {
        acar.delete().catch(err => {})
      })
    }
};