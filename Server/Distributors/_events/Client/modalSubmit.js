
const { Client, Message, Util, MessageActionRow, MessageButton, MessageSelectMenu, Collection, Permissions} = Discord = require("discord.js");
const { genEmbed } = require("../../../../Global/Init/Embed");
const { 
    Modal,
    TextInputComponent, 
    showModal,
    SelectMenuComponent,
  } = dcmodal = require('discord-modals')

module.exports = async (modal) => {
    let guild = client.guilds.cache.get(global.sistem.SERVER.ID)
    if(!guild) {
      await modal.deferReply({ ephemeral: true })
      return await modal.followUp({content: `Sistemsel hata oluştu.` , ephemeral: true })
    }
    let uye = guild.members.cache.get(modal.user.id)
    if(!uye){
      await modal.deferReply({ ephemeral: true })
      return await modal.followUp({content: `Sistemsel hata oluştu.` , ephemeral: true })
    }


    if(modal.customId == "isimDüzenleme") {
        if(!uye.roles.cache.has(roller.boosterRolü) && (roller.özelRoller && !roller.özelRoller.some(x => uye.roles.cache.has(x))) && !uye.permissions.has("ADMINISTRATOR") && !uye.permissions.has("MANAGE_ROLES") ) {
            await modal.deferReply({ ephemeral: true })
            return await modal.followUp({content: `Sunucumuza **boost* basmanız gerekmektedir.`})
        }
        if(ayarlar.type && ayarlar.isimyas) {
            if(roller.Yetkiler.some(x => uye.roles.cache.has(x)) && !roller.kurucuRolleri.some(oku => uye.roles.cache.has(oku)) && !uye.permissions.has('ADMINISTRATOR')) {
              let isim = modal.getTextInputValue('isim')
              let Nickname = uye.nickname.replace(ayarlar.tagsiz, "").replace(ayarlar.tag, "").replace(" ", "").split(" | ")[0]
              if(Nickname && uye.manageable) {
                uye.setNickname(uye.displayName.replace(Nickname, isim)).catch(err => {})
                await modal.deferReply({ ephemeral: true })
                return await modal.followUp({content: `Başarılı şekilde sunucuda isminiz güncellendi.`})
              } else {
                await modal.deferReply({ ephemeral: true })
                return await modal.followUp({content: `İsim değiştirirken bir hata oluştu veya botun yetkisi size yetmiyor.`})
              }
            }
        }
        let yazilacakIsim;
        let isim = modal.getTextInputValue('isim')
        if(ayarlar.type) yazilacakIsim = `${uye.user.username.includes(ayarlar.tag) ? ayarlar.tag : (ayarlar.tagsiz ? ayarlar.tagsiz : (ayarlar.tag || ""))} ${isim}`
        if(!ayarlar.type) yazilacakIsim = `${isim}`;
        if(uye.manageable) {
        uye.setNickname(`${yazilacakIsim}`).then(async (devam) => {
            await modal.deferReply({ ephemeral: true })
            return await modal.followUp({content: `Başarılı şekilde sunucuda isminiz güncellendi.`})
        }).catch( async (acar) => {
            await modal.deferReply({ ephemeral: true })
            return await modal.followUp({content: `İsim değiştirirken bir hata oluştu veya botun yetkisi size yetmiyor.`})
        })
      } else {
            await modal.deferReply({ ephemeral: true })
            return await modal.followUp({content: `İsim değiştirirken bir hata oluştu veya botun yetkisi size yetmiyor.`})
      }
    }

    if(modal.customId == "sunucuDüzenleme") {
        let isim = modal.getTextInputValue('name');
        let resim = modal.getTextInputValue('avatar');
        let arkaplan = modal.getTextInputValue('banner')
        let gerçekleşenİşlemler = []
        
        let eskiIsim = guild.name
        let eskiAvatar = guild.iconURL()
        let eskiBanner = guild.bannerURL()

        if(isim && isim.length > 0 && isim != eskiIsim) {
            await guild.setName(isim)
            gerçekleşenİşlemler.push(`İsim Değişimi`)
        }

        if(resim && resim.length > 0 && resim != eskiAvatar) {
            await guild.setIcon(resim)
            gerçekleşenİşlemler.push(`Resim Değişimi`)
        }

        if(arkaplan && arkaplan.length > 0 && arkaplan != eskiBanner) {
            await guild.setBanner(arkaplan)
            gerçekleşenİşlemler.push(`Banner Değişimi`)
        }

        if(gerçekleşenİşlemler.length > 0) {
            let logKanal = guild.kanalBul("guild-log")
            if(logKanal) logKanal.send({embeds: [new genEmbed().setColor("ORANGE")
    .setFooter(uye.user.tag + " tarafından güncellendi.",uye.user.avatarURL({dynamic: true}))
          .setDescription(`${guild.name} sunucusunda güncelleme ${uye} tarafından yapıldı.

**Sunucu İsmi**: \` ${isim ? isim != eskiIsim ? `${eskiIsim} -> ${isim}` : `Değişmedi!` : `Değişmedi!` } \`
**Sunucu Resmi**: \` ${resim ? resim != eskiAvatar ? `Değişti!` : `Değişmedi!` : `Değişmedi!` } \`
**Sunucu Banner**: \` ${arkaplan ? arkaplan != eskiBanner ? `Değişti!` : `Değişmedi!` : `Değişmedi!` } \`
`)
.addField(`Gerçekleşen Ayarlar`,`\`\`\`
${gerçekleşenİşlemler.join("\n")}
\`\`\``)]})
            await modal.deferReply({ ephemeral: true })
            return await modal.followUp({embeds: [new genEmbed().setColor("GREEN").setDescription(`Başarıyla ${guild.name} sunucusu üzerinde işlem(ler) <t:${String(Date.now()).slice(0, 10)}:F> tarihinde gerçekleştirildi/güncelleştirildi.

**Aşağıda gerçekleşen işlemler tamamlandı**:
\`\`\`
${gerçekleşenİşlemler.join("\n")}
\`\`\``)] , ephemeral: true })
        } else {
            await modal.deferReply({ ephemeral: true })
            return await modal.followUp({content: `Sunucu üzerinde bir değişiklik yapılmadı.` , ephemeral: true })
        }
          
    }
}

module.exports.config = {
    Event: "modalSubmit"
}