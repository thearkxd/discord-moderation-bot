const moment = require("moment");
moment.locale("tr");
const conf = require("../configs/config.json");
const { MessageEmbed } = require("discord.js");

module.exports = async (oldMessage, newMessage) => {
  if (oldMessage.author.bot) return;

  const channel = newMessage.guild.channels.cache.get(conf.logs.messageLog);
  if (!channel) return;
  const embed = new MessageEmbed()
    .setAuthor(newMessage.member.displayName, newMessage.author.avatarURL({ dynamic: true }))
    .setColor("BLUE")
    .setTitle(`${newMessage.channel.name} adlı kanalda bir mesaj düzenlendi!`)
    .setDescription(`- ${oldMessage.content} \n+ ${newMessage.content}`)
    .setFooter(`ID: ${newMessage.author.id} • ${moment().add(3, "hours").calendar()}`);

  if (newMessage.attachments.first()) embed.setImage(newMessage.attachments.first().proxyURL);
  channel.send(embed);
};

module.exports.conf = {
  name: "messageUpdate",
};
