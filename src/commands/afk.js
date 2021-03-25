const afk = require("../schemas/afk");

module.exports = {
    conf: {
      aliases: [],
      name: "afk",
      help: "afk [sebep]",
    },
  
    /**
     * @param { Client } client
     * @param { Message } message
     * @param { Array<String> } args
     */
  
    run: async (client, message, args, embed) => {
      const reason = args.join(" ") || "Belirtilmedi!";
      await afk.findOneAndUpdate({ guildID: message.guild.id, userID: message.author.id }, { $set: { reason, date: Date.now() } }, { upsert: true });
      message.channel.send(embed.setDescription("Başarıyla afk moduna girdiniz!")).then((x) => x.delete({ timeout: 5000 }));
      if (message.member.manageable) message.member.setNickname(`[AFK] ${message.member.displayName}`);
    },
  };
  