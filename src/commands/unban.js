const conf = require("../configs/config.json");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");
moment.locale("tr");
const penals = require("../schemas/penals");

module.exports = {
  conf: {
    aliases: [],
    name: "unban",
    help: "unban [kullanıcı]",
  },

  /**
   * @param { Client } client
   * @param { Message } message
   * @param { Array<String> } args
   */

  run: async (client, message, args, embed) => {
    if (!message.member.hasPermission("BAN_MEMBERS") && !conf.penals.ban.staffs.some(x => message.member.roles.cache.has(x))) return message.channel.error(message, "Yeterli yetkin bulunmuyor!");
    if (!args[0]) return message.channel.error(message, "Bir üye belirtmelisin!");
    const ban = await client.fetchBan(message.guild, args[0]);
    if (!ban) return message.channel.error(message, "Bu üye banlı değil!");
    
    message.guild.members.unban(args[0], `${message.author.username} tarafından kaldırıldı!`).catch(() => {});
    const data = await penals.findOne({ userID: ban.user.id, guildID: message.guild.id, type: "BAN", active: true });
    if (data) {
      data.active = false;
      await data.save();
    }
    message.channel.send(embed.setDescription(`\`(${ban.user.username.replace(/\`/g, "")} - ${ban.user.id})\` adlı üyenin banı ${message.author} tarafından kaldırıldı!`));
    if (conf.dmMessages) ban.user.send(`**${message.guild.name}** sunucusunda, **${message.author.tag}** tarafından banınız kaldırıldı!`).catch(() => {});

    const log = new MessageEmbed()
      .setAuthor(ban.user.username, ban.user.avatarURL({ dynamic: true, size: 2048 }))
      .setColor("GREEN")
      .setDescription(`
\`(${ban.user.username.replace(/\`/g, "")} - ${ban.user.id})\` üyesinin banı kaldırıldı!

Banı Kaldıran Yetkili: ${message.author} \`(${message.author.username.replace(/\`/g, "")} - ${message.author.id})\`
Banın Kaldırılma Tarihi: \`${moment(Date.now()).format("LLL")}\`
      `)
    message.guild.channels.cache.get(conf.penals.ban.log).send(log);
  },
};
