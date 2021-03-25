const moment = require("moment");
moment.locale("tr");
const conf = require("../configs/config.json");
const { MessageEmbed } = require("discord.js");

module.exports = async (message) => {
  if (message.author.bot) return;

  const channel = message.guild.channels.cache.get(conf.logs.messageLog);
  const embed = new MessageEmbed()
    .setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true }))
    .setColor("RED")
    .setTitle(`${message.channel.name} adlı kanalda bir mesaj silindi!`)
    .setDescription(message.content)
    .setFooter(`ID: ${message.author.id} • ${moment().calendar()}`);
  
  if (message.attachments.first()) embed.setImage(message.attachments.first().proxyURL);
  channel.send(embed);
};

module.exports.conf = {
  name: "messageDelete",
};
