const { Client, Message, MessageEmbed, MessageAttachment, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const Users = require('../../../../Global/Databases/Schemas/Client.Users');
const moment = require("moment");
const { genEmbed } = require("../../../../Global/Init/Embed");

require("moment-duration-format");
const mongoose = require("mongoose");
let Select = new Map()
const { 
  Modal,
  TextInputComponent,
  SelectMenuComponent,
  showModal
} = dcmodal = require('discord-modals')


const Sorumluluk = require('../../../../Global/Databases/Schemas/Plugins/Guild.Responsibility');

module.exports = {
    Isim: "sorumluluk",
    Komut: ["sorumluluk", "sorumlu"],
    Kullanim: "profil <@acar/ID>",
    Aciklama: "Belirlenen kişinin veya kullanan kişinin sunucu içerisindeki detaylarını ve discord içerisindeki bilgilerini aktarır.",
    Kategori: "diğer",
    Extend: true,
    
   /**
   * @param {Client} client 
   */
  onLoad: function (client) {
    client.on('interactionCreate', async (i) => {
      if(i.customId != "sorumluluk_sistem") return;
      let _data = await Sorumluluk.find({})
      let arr = []
      
      _data.map(d => {
        arr.push({
          name: d.name,
          value: d.role,
          leaders: d.leaders
        })
      })

      let guild = client.guilds.cache.get(i.guildId)
      if(!guild) return;
      let uye = guild.members.cache.get(i.user.id)
      if(!uye) return;

      let _get = arr.find(x => i.values == x.value) 
      if(_get) {

        Select.set(uye.id, {
          name: _get.name,
          role: _get.value,
          leaders: _get.leaders 
        })

        const modal = new Modal()
        .setCustomId('sorumlulukBasvuru')
        .setTitle(`${_get.name}`)
        .addComponents(
          new TextInputComponent()
          .setCustomId('isimyas')
          .setLabel('İsiminiz ve yaşınız ?')
          .setStyle('SHORT')
          .setMinLength(5)
          .setMaxLength(25)
          .setPlaceholder('Örn: Acar 20')
          .setRequired(true),
          new TextInputComponent()
          .setCustomId('referans')
          .setLabel('Referans')
          .setStyle('SHORT')
          .setMinLength(5)
          .setMaxLength(100)
          .setPlaceholder('Örn: acar#0001/ID')
          .setRequired(false),
          new TextInputComponent()
          .setCustomId('sorumluluk')
          .setLabel('Bu sorumluluğu neden istiyorsunuz?')
          .setStyle('LONG')
          .setMinLength(5)
          .setMaxLength(500)
          .setPlaceholder('Açıklayın...')
          .setRequired(true),
        );
        return showModal(modal, {
          client: client,
          interaction: i 
        })
      }
     
    })

    client.on("modalSubmit", async (modal) => {
      if(modal.customId == "sorumluluk-kaldır") {

      }
      if(modal.customId == "sorumlulukBasvuru") {
        let guild = client.guilds.cache.get(global.sistem.SERVER.ID)
        if(!guild) {
          await modal.deferReply({ ephemeral: true })
          return await modal.followUp({content: `Sistemsel hata oluştu.` , ephemeral: true })
        }
        let uye = guild.members.cache.get(modal.user.id)
        if(!uye)  {
          await modal.deferReply({ ephemeral: true })
          return await modal.followUp({content: `Sistemsel hata oluştu.` , ephemeral: true })
        }
        let logKanalı = guild.kanalBul("başvuru-log")
        if(!logKanalı) {
          await modal.deferReply({ ephemeral: true })
          return await modal.followUp({content: `Başvuru kanalı bulunmadığından dolayı, işleminize devam edemiyoruz. ${cevaplar.prefix}` , ephemeral: true })
        }
        let isimyas = modal.getTextInputValue('isimyas');    
        let sorumluluk = modal.getTextInputValue('sorumluluk');  
        let refernas = modal.getTextInputValue('referans');
        let getir = Select.get(uye.id)
        if(!getir) {
          await modal.deferReply({ ephemeral: true })
          return await modal.followUp({content: `Sistemsel bir hata oluştu. ${cevaplar.prefix}` , ephemeral: true })
        }
        let sorumlulukIsmi = getir.name
        let sorumlulukRolü = getir.role
        let Selector = getir.leaders || []
        if(uye.roles.cache.has(sorumlulukRolü)) {
          await modal.deferReply({ ephemeral: true })
          return await modal.followUp({content: `Üzerinizde bu sorumluluk rolü bulunduğu için işlem iptal edildi. ${cevaplar.prefix}` , ephemeral: true })
        }
        let altYetki = guild.roles.cache.get(roller.altilkyetki)
        let embed = new genEmbed().setAuthor(uye.user.tag, uye.user.avatarURL({dynamic: true})).setDescription(`${uye} isimli üye (**${sorumlulukIsmi}**) ${guild.roles.cache.get(sorumlulukRolü)} rolü için  <t:${Number(String(Date.now()).substring(0, 10))}:F> tarihinde başvurdu.`).setFooter(ayarlar.serverName + " • Yeni Sorumluluk Başvurusu!", uye.user.avatarURL({dynamic: true}))
        embed.addField(`Başvuru Bilgisi`, `> İsim & Yaş: ${isimyas}
> Referans: ${refernas ? `${guild.members.cache.find(x => x.user.tag == refernas || x.user.username.includes(refernas) || x.id == refernas) ? guild.members.cache.find(x => x.user.tag == refernas || x.user.username.includes(refernas) || x.id == refernas) : `${refernas}`}` : "Bir referans belirtilmemiş."}
> Neden istiyor? ${sorumluluk}`)
        let yetkiler = uye.roles.cache.filter(rol => altYetki.position <= rol.position)
        if(yetkiler) embed.addField(`Üzerindeki Yetki Rolleri`, `${yetkiler.map(x => x).join("\n")}`)
        logKanalı.send({content: `${Selector.map(x => guild.roles.cache.get(x)).join(", ")}`, embeds: [embed]})
        await modal.deferReply({ ephemeral: true })
        Select.delete(uye.id)
        return await modal.followUp({content: `Başarıyla ${guild.roles.cache.get(sorumlulukRolü)} rolüne başvurunuz iletilmiştir! Gerekli kontrollerden ve denetimlerden sonra ${Selector.map(x => guild.roles.cache.get(x)).join(", ")} rolüne sahip yöneticiler seninle ilgilenecektir. Tebrikler!`, ephemeral: true})

      }


      if(modal.customId == "sorumluluk-ekle") {
        let guild = client.guilds.cache.get(global.sistem.SERVER.ID)
        if(!guild) {
          await modal.deferReply({ ephemeral: true })
          return await modal.followUp({content: `Sistemsel hata oluştu.` , ephemeral: true })
        }
        let uye = guild.members.cache.get(modal.user.id)
        if(!uye)  {
          await modal.deferReply({ ephemeral: true })
          return await modal.followUp({content: `Sistemsel hata oluştu.` , ephemeral: true })
        }
        let name = modal.getTextInputValue('name');
        let role = modal.getTextInputValue('role');
        let leaders = modal.getTextInputValue('leaders');

        if(role && !guild.roles.cache.get(role)) {
          await modal.deferReply({ ephemeral: true })
          return await modal.followUp({content: `Belirtilen sorumluluk rolü sunucuda bulunamadı.` , ephemeral: true })
        }

        if(leaders && !leaders.split(' ').every(x => guild.roles.cache.get(x))) {
          await modal.deferReply({ ephemeral: true })
          return await modal.followUp({content: `Belirtilen sorumluluk lider rolleri sunucuda bulunamadı.` , ephemeral: true })
        }

        await Sorumluluk.updateOne({name: name}, {
        $set: {
          name: name,
          role: role,
          leaders: leaders ? leaders.split(' ') : [],
          date: Date.now(),
          created: uye.id,
        }
        }, {upsert: true})

        await modal.deferReply({ ephemeral: true })
        return await modal.followUp({content: `${guild.emojiGöster(emojiler.Onay)} Başarıyla ${name} sorumluluğu başarıyla <t:${String(Date.now()).slice(0, 10)}:R> eklendi.` , ephemeral: true })
      }
    })
  },

   /**
   * @param {Client} client 
   * @param {Message} message 
   * @param {Array<String>} args 
   */

  onRequest: async function (client, message, args) {

    let Buttons = [
      new MessageButton()
      .setLabel("Oluştur")
      .setCustomId("add")
      .setEmoji("943265806341513287")
      .setStyle("SUCCESS"),
    ]

    let _data = await Sorumluluk.find({})

    if(_data && _data.length > 0) Buttons.push(
      new MessageButton()
      .setLabel("Kur")
      .setEmoji("943286195406925855")
      .setCustomId("install")
      .setStyle("SECONDARY"),
      new MessageButton()
      .setLabel("Listele")
      .setEmoji("943290426562076762")
      .setCustomId("list")
      .setStyle("SECONDARY"),
      new MessageButton()
      .setLabel("Kaldır")
      .setEmoji("943265806547038310")
      .setCustomId("remove")
      .setStyle("DANGER"),
      new MessageButton()
      .setLabel("Tüm Sorumlulukları Temizle")
      .setCustomId("reset")
      .setEmoji("927314290732576809")
      .setStyle("DANGER"),
    )
    let msg = await message.reply({content: `Sorumluluk sistemi yüklenirken bekleyin...`});
    let Row = new MessageActionRow().addComponents(Buttons)      
    msg.edit({embeds: [new genEmbed().setDescription(`Aşağıda bulunan düğmeler ile sorumluluk sistemini yönetebilirsin.`)], content: null, components: [Row]})
    var filter = (i) => i.user.id == message.author.id
    let collector = msg.createMessageComponentCollector({filter: filter, time: 120000 });
    collector.on('end', (c, reason) => {
      if(reason == "time") {
        msg.edit({content: `Sorumluluk sistemi işlem yapma süresi doldu.`})
        setTimeout(() => {
          msg.delete().catch(err => {})
        }, 7500)
      }

    })
    collector.on('collect', async (i) => {
      if(i.customId == "list") {
        let _get = await Sorumluluk.find({})
        let _data = _get.map((x, index) => `**${x.name}**: 
Sorumlu Rolü: ${message.guild.roles.cache.get(x.role) ? message.guild.roles.cache.get(x.role) : "@Rol Bulunamadı"}
Lider Rolü(leri): ${x.leaders.map(x => message.guild.roles.cache.get(x) ? message.guild.roles.cache.get(x) : "@Rol Bulunamadı").join(", ")}
Oluşturan: ${message.guild.members.cache.get(x.created) ? message.guild.members.cache.get(x.created) : `<@${x.created}>`} (<t:${String(x.date).slice(0, 10)}:R>)`)
        msg.edit({embeds: [new genEmbed().setDescription(`Aşağı da ${message.guild.name} sunucusuna ait sorumluluklar listelenmektedir.

${_data.join("\n──────────────────────────\n")}`)], content: null, components: []})
      }
      if(i.customId == "reset") {
        await Sorumluluk.deleteMany({})
        msg.edit({embeds: [new genEmbed().setDescription(`Başarıyla tüm sorumluluklar sıfırlandı. ${message.guild.emojiGöster(emojiler.Onay)}`)], content: null, components: []})
        setTimeout(() => {
          msg.edit({embeds: [new genEmbed().setDescription(`Aşağıda bulunan düğmeler ile sorumluluk sistemini yönetebilirsin.`)], content: null, components: [Row]})
        }, 7500)
      }
      if(i.customId == "silSorumluluk") {
        let _get = await Sorumluluk.findOne({role: i.values[0]})

        msg.edit({embeds: [new genEmbed().setDescription(`Başarıyla **${_get ? _get.name : "@"}** sorumluluğu silindi. ${message.guild.emojiGöster(emojiler.Onay)}`)], content: null, components: []})
        await Sorumluluk.deleteOne({role: i.values[0]})
        setTimeout(() => {
          msg.edit({embeds: [new genEmbed().setDescription(`Aşağıda bulunan düğmeler ile sorumluluk sistemini yönetebilirsin.`)], content: null, components: [Row]})
        }, 3500)
      }
      if(i.customId == "remove") {
        let _data = await Sorumluluk.find({})
        if(_data && _data.length > 0) { 
          let arr = []
          _data.forEach(x => {
            arr.push({
              label: x.name,
              value: x.role,
              description: `${message.guild.roles.cache.get(x.role) ? message.guild.roles.cache.get(x.role).name : `@Rol Bulunamadı`}`
            })
          })
          let Roww = new MessageActionRow().addComponents(
            new MessageSelectMenu()
            .setCustomId("silSorumluluk")
              .setPlaceholder("Silmek istediğin sorumluluğu seç...")
              .setOptions(arr)
          )
          msg.edit({embeds: [new genEmbed().setDescription(`Aşağıda bulunan ve listelenmekte olan sorumluluklardan hangisi silmek istersin?`).setFooter("Minimum 1 tane rol kalana kadar rahatlıkla silebilirsiniz.")], content: null, components: [Roww]})
        } else {
          i.reply({content: `Silinebilcek bir sorumluluk bulunamadığından işlem iptal edildi.`, ephemeral: true})
        }
      }
      if(i.customId == "install") {
        let _data = await Sorumluluk.find({})
        if(_data && _data.length > 0) { 
            let arr = []
            _data.forEach(x => {
              arr.push({
                label: x.name,
                value: x.role,
                emoji: {id: "963745852327886888"},
                description: `${message.guild.roles.cache.get(x.role) ? message.guild.roles.cache.get(x.role).name : `@Rol Bulunamadı`} rolüne başvuru açıktır.`
              })
            })
            let Roww = new MessageActionRow().addComponents(
              new MessageSelectMenu()
              .setCustomId("sorumluluk_sistem")
                .setPlaceholder("Başvurmak istediğiniz sorumluluk seçin...")
                .setOptions(arr)
            )
            msg.edit({embeds: [new genEmbed().setDescription(`Başarıyla sorumluluk sistemi kurulumu tamamlandı. ${message.guild.emojiGöster(emojiler.Onay)}`)], content: null, components: []})
            setTimeout(() => {
              msg.edit({embeds: [new genEmbed().setDescription(`Aşağıda bulunan düğmeler ile sorumluluk sistemini yönetebilirsin.`)], content: null, components: [Row]})
            }, 3500)
            message.channel.send({content: `**Merhaba!** ${ayarlar.serverName} ${message.guild.emojiGöster(emojiler.Tag)}
Aşağıda bulunan başvurusu açık sorumluluk rollerinden başvurmak istediğinizi seçiniz.`, components: [Roww]})
i.reply({content: `Başarıyla ayarlamış olduğunuz sorumluluk başvuru sistemi açıldı. ${message.guild.emojiGöster(emojiler.Onay)}`, ephemeral: true})
        } else {
          i.reply({content: `Kurulum yapabilmeniz için en az bir sorumluluk oluşturmalısınız.`, ephemeral: true})
        }
      }
      if(i.customId == "add") {
        msg.delete().catch(err => {})
        const modal = new Modal()
        .setCustomId('sorumluluk-ekle')
        .setTitle(`Sorumluluk Ekleme`)
        .addComponents(
          new TextInputComponent()
          .setCustomId('name')
          .setLabel('Sorumluluk Ismi')
          .setStyle('SHORT')
          .setMinLength(3)
          .setMaxLength(120)
          .setPlaceholder(`Örn: Davet Sorumlusu`)
          .setRequired(true),
          new TextInputComponent()
          .setCustomId('role')
          .setLabel('Sorumluluk Rolü')
          .setStyle('SHORT')
          .setMinLength(3)
          .setMaxLength(120)
          .setPlaceholder(`Örn: 945635133757587457`)
          .setRequired(true),
          new TextInputComponent()
          .setCustomId('leaders')
          .setLabel('Sorumluluk Sorumluları')
          .setStyle('LONG')
          .setMinLength(3)
          .setMaxLength(1024)
          .setPlaceholder(`Rol ID'si verilmelidir. Birden fazla için aralarına boşluk koyunuz.`)
          .setRequired(true),
        );
        showModal(modal, {
          client: client,
          interaction: i 
        })
      }
    })
    }
};


