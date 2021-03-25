const { emojis } = require("../configs/config.json");

module.exports = {
  conf: {
    aliases: [],
    name: "çek",
    help: "çek [kullanıcı]",
  },

  /**
   * @param { Client } client
   * @param { Message } message
   * @param { Array<String> } args
   */

  run: async (client, message, args, embed) => {
    if (!message.member.hasPermission(8)) return message.channel.error(message, "Yeterli yetkiye sahip değilsin!");
    if (!message.member.voice.channel) return message.channel.error(message, "Bir ses kanalında olmalısın!"); 
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.channel.error(message, 'Bir member belirtmelisin!');
    if (!member.voice.channel) return message.channel.error(message, "Belirtilen member herhangi bir ses kanalında değil!");
    member.voice.setChannel(message.member.voice.channelID);

    message.channel.send(embed.setDescription(`${emojis.mark} ${member} üyesi \`${message.member.voice.channel.name}\` kanalına çekildi!`));
  },
};
