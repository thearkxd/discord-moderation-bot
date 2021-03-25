const { emojis } = require("../configs/config.json");

module.exports = {
  conf: {
    aliases: ["purge"],
    name: "sil",
    help: "sil [miktar]",
  },

  /**
   * @param { Client } client
   * @param { Message } message
   * @param { Array<String> } args
   */

  run: async (client, message, args, embed) => {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return;
    if (!args[0]) return message.channel.error(message, "Bir miktar belirtmelisin!");
    if (isNaN(args[0])) return message.channel.error(message, "Belirttiğin miktar bir sayı olmalı!");
    await message.delete();
    await message.channel.bulkDelete(args[0]);
    message.channel.send(embed.setDescription(`${emojis.mark} ${args[0]} adet mesaj silindi!`));
  },
};
