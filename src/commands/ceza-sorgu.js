const { emojis } = require("../configs/config.json");
const moment = require("moment");
moment.locale("tr");
const penals = require("../schemas/penals");

module.exports = {
  conf: {
    aliases: ["ceza-sorgu", "cezasorgu", "ceza-bilgi"],
    name: "cezabilgi",
    help: "cezabilgi [ceza id]"
  },

  /**
   * @param { Client } client
   * @param { Message } message
   * @param { Array<String> } args
   */

  run: async (client, message, args, embed) => {
    if (isNaN(args[0])) return message.channel.error(message, "Ceza ID'si bir sayı olmalıdır!");
    const data = await penals.findOne({ guildID: message.guild.id, id: args[0] });
    if (!data) return message.channel.error(message, `${args[0]} ID'li bir ceza bulunamadı!`);
    message.channel.send(embed.setDescription(`#${data.id} ${data.active ? emojis.mark : emojis.cross} **[${data.type}]** <@${data.userID}> üyesi, ${moment(data.date).format("LLL")} tarihinde, <@${data.staff}> tarafından, \`${data.reason}\` nedeniyle, ${data.type.toLowerCase().replace("-", " ")} cezası almış.`));
  },
};
