module.exports = {
  conf: {
    aliases: [],
    name: "allunmute",
    help: "allunmute",
  },

  /**
   * @param { Client } client
   * @param { Message } message
   * @param { Array<String> } args
   */

  run: async (client, message, args, embed) => {
    if (!message.member.hasPermission("MOVE_MEMBERS")) return;
    let channel = message.guild.channels.cache.get(args[0]) || message.member.voice.channel;
    if (!channel) return message.channel.error(message, "Bir kanal ID girmeli ya da bir sesli kanalda bulunmalısın!");
    channel.members.forEach((x, index) => {
      client.wait(index * 1000);
      x.voice.setMute(false);
    });
    message.channel.send(embed.setDescription(`\`${channel.name}\` kanalındaki tüm üyelerin susturulması kaldırıldı!`));
  },
};
