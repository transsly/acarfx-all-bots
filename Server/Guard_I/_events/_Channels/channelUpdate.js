const { GuildMember, MessageEmbed, GuildChannel, Guild } = require("discord.js");
const { genEmbed } = require("../../../../Global/Init/Embed");


/**
* @param {GuildChannel} oldChannel
* @param {GuildChannel} newChannel
*/


module.exports = async (oldChannel, newChannel) => {
  const Guard = require('../../../../Global/Databases/Schemas/Guards/Global.Guard.Settings');
  let Data = await Guard.findOne({guildID: oldChannel.guild.id})
  if(Data && !Data.channelGuard) return;
   let embed = new genEmbed().setTitle("Sunucuda Kanal Güncellendi!")
   let entry = await newChannel.guild.fetchAuditLogs({type: 'CHANNEL_UPDATE'}).then(audit => audit.entries.first())
   if(!entry || !entry.executor || entry.createdTimestamp <= Date.now() - 5000 || await client.checkMember(entry.executor.id, "channels" ,"Kanal Güncelleme!")) return;
   client.punitivesAdd(entry.executor.id, "ban")
   client.allPermissionClose()
   if (newChannel.type !== "GUILD_CATEGORY" && newChannel.parentId !== oldChannel.parentId) newChannel.setParent(oldChannel.parentId);
   if (newChannel.type === "GUILD_CATEGORY") {
     await newChannel.edit({
       position: oldChannel.position,
       name: oldChannel.name,
     });
   } else if (newChannel.type === "GUILD_TEXT" || (newChannel.type === 'GUILD_NEWS')) {
     await newChannel.edit({
       name: oldChannel.name,
       position: oldChannel.position,
       topic: oldChannel.topic,
       nsfw: oldChannel.nsfw,
       rateLimitPerUser: oldChannel.rateLimitPerUser,
     });
   } else if (newChannel.type === "GUILD_VOICE") {
     await newChannel.edit({
       name: oldChannel.name,
       position: oldChannel.position,
       bitrate: oldChannel.bitrate,
       userLimit: oldChannel.userLimit,
     });
   };

   embed.setDescription(`${entry.executor} (\`${entry.executor.id}\`) tarafından \`#${oldChannel.name}\` isimli kanal güncellendi ve ayarları eski haline getirelerek yapan kişi yasaklandı.`);
   let loged = newChannel.guild.kanalBul("guard-log");
   if(loged) await loged.send({embeds: [embed]});
   const owner = await newChannel.guild.fetchOwner();
   if(owner) owner.send({embeds: [embed]}).catch(err => {})
   client.processGuard({
    type: "Kanal Güncelleme!",
    target: entry.executor.id,
})
}

module.exports.config = {
   Event: "channelUpdate"
}

