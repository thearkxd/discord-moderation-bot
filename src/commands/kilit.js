module.exports = {
  conf: {
    aliases: ["lock"],
    name: "kilit",
    help: "kilit",
  },

  /**
   * @param { Client } client
   * @param { Message } message
   * @param { Array<String> } args
   */

  run: async (client, message, args, embed) => {
    if (!message.member.hasPermission("MANAGE_CHANNELS")) return;
    if (message.channel.permissionsFor(message.guild.roles.everyone).has("SEND_MESSAGES")) {
      message.channel.updateOverwrite(message.guild.roles.everyone, {
        SEND_MESSAGES: false,
      });
      message.channel.send(embed.setDescription("Kanal kilitlendi!"));
    } else {
      message.channel.updateOverwrite(message.guild.roles.everyone, {
        SEND_MESSAGES: null,
      });
      message.channel.send(embed.setDescription("Kanal kilidi açıldı!"));
    }
  },
};
