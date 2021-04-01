const conf = require("../configs/config.json");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const jailLimit = new Map();
moment.locale("tr");

module.exports = {
  conf: {
    aliases: ["karantina"],
    name: "jail",
    help: "jail [kullanıcı] [sebep]",
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
    const reason = args.slice(1).join(" ") || "Belirtilmedi!";
    if (!message.member.hasPermission(8) && member.roles.highest.position >= message.member.roles.highest.position) return message.channel.error(embed.setDescription("Kendinle aynı yetkide ya da daha yetkili olan birini jailleyemezsin!"));
    if (!member.manageable) return message.channel.error(message, "Bu üyeyi jailleyemiyorum!");
    if (conf.penals.jail.limit > 0 && jailLimit.has(message.author.id) && jailLimit.get(message.author.id) == conf.penals.jail.limit) return message.channel.error(message, "Saatlik jail sınırına ulaştın!");

    member.setRoles(conf.penals.jail.roles);
    const penal = await client.penalize(message.guild.id, member.user.id, "JAIL", true, message.author.id, reason);
    message.channel.send(embed.setDescription(`${member.toString()} üyesi, ${message.author} tarafından, \`${reason}\` nedeniyle jaillendi! \`(Ceza ID: #${penal.id})\``));
    if (conf.dmMessages) member.send(`**${message.guild.name}** sunucusunda, **${message.author.tag}** tarafından, **${reason}** sebebiyle jaillendiniz!`).catch(() => {});

    const log = new MessageEmbed()
      .setAuthor(member.user.username, member.user.avatarURL({ dynamic: true, size: 2048 }))
      .setColor("RED")
      .setDescription(`
${member.toString()} üyesi jaillendi!

Ceza ID: \`#${penal.id}\`
Jaillenen Üye: ${member.toString()} \`(${member.user.username.replace(/\`/g, "")} - ${member.user.id})\`
Jailleyen Yetkili: ${message.author} \`(${message.author.username.replace(/\`/g, "")} - ${message.author.id})\`
Jail Tarihi: \`${moment(Date.now()).format("LLL")}\`
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
