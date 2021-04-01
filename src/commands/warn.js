const conf = require("../configs/config.json");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");
moment.locale("tr");
const penals = require("../schemas/penals");

module.exports = {
  conf: {
    aliases: ["warn","uyarı"],
    name: "uyar",
    help: "uyar [kullanıcı] [sebep]",
  },

  /**
   * @param { Client } client
   * @param { Message } message
   * @param { Array<String> } args
   */

  run: async (client, message, args, embed) => {
    if (!message.member.hasPermission(8) && !conf.penals.warn.staffs.some(x => message.member.roles.cache.has(x))) return message.channel.error(message, "Yeterli yetkin bulunmuyor!");
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.channel.error(message, "Bir üye belirtmelisin!");
    const reason = args.slice(2).join(" ") || "Belirtilmedi!";
    if (!message.member.hasPermission(8) && member.roles.highest.position >= message.member.roles.highest.position) return message.channel.error(message, "Kendinle aynı yetkide ya da daha yetkili olan birini susturamazsın!");
    if (!member.manageable) return message.channel.error(message, "Bu üyeyi susturamıyorum!");

    const penal = await client.penalize(message.guild.id, member.user.id, "WARN", false, message.author.id, reason);
    const data = await penals.find({ guildID: message.guild.id, userID: member.user.id, type: "WARN" });
    if (data.length > 0 && conf.penals.warn.roles.some(x => data.length == x.warnCount)) member.roles.add(conf.penals.warn.roles.find(x => data.length == x.warnCount).role);
    message.channel.send(embed.setDescription(`${member.toString()} üyesi, ${message.author} tarafından, \`${reason}\` nedeniyle susturuldu! \`(Ceza ID: #${penal.id})\``));
    if (conf.dmMessages) member.send(`**${message.guild.name}** sunucusunda, **${message.author.tag}** tarafından, **${reason}** sebebiyle uyarıldınız!`).catch(() => {});
    
    const log = new MessageEmbed()
      .setAuthor(member.user.username, member.user.avatarURL({ dynamic: true, size: 2048 }))
      .setColor("RED")
      .setDescription(`
${member.toString()} üyesi uyarıldı!

Ceza ID: \`#${penal.id}\`
Uyarılan Üye: ${member.toString()} \`(${member.user.username.replace(/\`/g, "")} - ${member.user.id})\`
Uyaran Yetkili: ${message.author} \`(${message.author.username.replace(/\`/g, "")} - ${message.author.id})\`
Uyarı Tarihi: \`${moment(Date.now()).format("LLL")}\`
Uyarı Sebebi: \`${reason}\`
      `);
    message.guild.channels.cache.get(conf.penals.warn.log).send(log);
  },
};
