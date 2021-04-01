const conf = require("../configs/config.json");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const jailLimit = new Map();
moment.locale("tr");
const ms = require("ms");

module.exports = {
  conf: {
    aliases: ["tjail"],
    name: "tempjail",
    help: "tempjail [kullanıcı] [süre] [sebep]",
  },

  /**
   * @param { Client } client
   * @param { Message } message
   * @param { Array<String> } args
   */

  run: async (client, message, args, embed) => {
    if (!message.member.hasPermission(8) && !conf.penals.jail.staffs.some(x => message.member.roles.cache.has(x))) return message.channel.error(embed.setDescription("Yeterli yetkin bulunmuyor!"));
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.channel.error(message, "Bir üye belirtmelisin!");
    if (conf.penals.jail.roles.some(x => member.roles.cache.has(x))) return message.channel.error(message, "Bu üye zaten jailde!");
    const duration = args[1] ? ms(args[1]) : undefined;
    if (!duration) return message.channel.error(message, `Geçerli bir süre belirtmelisin!`);
    const reason = args.slice(2).join(" ") || "Belirtilmedi!";
    if (!message.member.hasPermission(8) && member.roles.highest.position >= message.member.roles.highest.position) return message.channel.error(embed.setDescription("Kendinle aynı yetkide ya da daha yetkili olan birini jailleyemezsin!"));
    if (!member.manageable) return message.channel.error(message, "Bu üyeyi jailleyemiyorum!");
    if (conf.penals.jail.limit > 0 && jailLimit.has(message.author.id) && jailLimit.get(message.author.id) == conf.penals.jail.limit) return message.channel.error(message, "Saatlik jail sınırına ulaştın!");

    member.setRoles(conf.penals.jail.roles);
    const penal = await client.penalize(message.guild.id, member.user.id, "TEMP-JAIL", true, message.author.id, reason, true, Date.now() + duration);
    message.channel.send(embed.setDescription(`${member.toString()} üyesi, ${message.author} tarafından, \`${reason}\` nedeniyle jaillendi! \`(Ceza ID: #${penal.id})\``));
    const time = ms(duration).replace("h", " saat").replace("m", " dakika").replace("s", " saniye");
    if (conf.dmMessages) member.send(`**${message.guild.name}** sunucusunda, **${message.author.tag}** tarafından, **${reason}** sebebiyle, **${time}** boyunca jaillendiniz!`).catch(() => {});
    
    const log = new MessageEmbed()
      .setAuthor(member.user.username, member.user.avatarURL({ dynamic: true, size: 2048 }))
      .setColor("RED")
      .setDescription(`
${member.toString()} üyesi, \`${time}\` boyunca jaillendi!

Ceza ID: \`#${penal.id}\`
Jaillenen Üye: ${member.toString()} \`(${member.user.username.replace(/\`/g, "")} - ${member.user.id})\`
Jailleyen Yetkili: ${message.author} \`(${message.author.username.replace(/\`/g, "")} - ${message.author.id})\`
Jail Tarihi: \`${moment(Date.now()).format("LLL")}\`
Jail Bitiş Tarihi: \`${moment(Date.now() + duration).format("LLL")}\`
Jail Sebebi: \`${reason}\`
      `)
    message.guild.channels.cache.get(conf.penals.jail.log).send(log);

    if (conf.penals.jail.limit > 0) {
      if (!jailLimit.has(message.author.id)) jailLimit.set(message.author.id, 1);
      else jailLimit.set(message.author.id, jailLimit.get(message.author.id) + 1);
      setTimeout(() => {
        if (jailLimit.has(message.author.id)) jailLimit.delete(message.author.id);
      }, 1000 * 60 * 60);
    }
  },
};
