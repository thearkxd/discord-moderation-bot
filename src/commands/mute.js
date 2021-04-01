const conf = require("../configs/config.json");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const muteLimit = new Map();
moment.locale("tr");
const ms = require("ms");

module.exports = {
  conf: {
    aliases: ["mute", "sustur", "chatmute", "chat-mute"],
    name: "cmute",
    help: "cmute [kullanıcı] [süre] [sebep]",
  },

  /**
   * @param { Client } client
   * @param { Message } message
   * @param { Array<String> } args
   */

  run: async (client, message, args, embed) => {
    if (!message.member.hasPermission(8) && !conf.penals.chatMute.staffs.some(x => message.member.roles.cache.has(x))) return message.channel.error(message, "Yeterli yetkin bulunmuyor!");
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.channel.error(message, "Bir üye belirtmelisin!");
    if (conf.penals.chatMute.roles.some(x => member.roles.cache.has(x))) return message.channel.error(message, "Bu üye zaten susturulmuş!");
    const duration = args[1] ? ms(args[1]) : undefined;
    if (!duration) return message.channel.error(message, `Geçerli bir süre belirtmelisin!`);
    const reason = args.slice(2).join(" ") || "Belirtilmedi!";
    if (!message.member.hasPermission(8) && member.roles.highest.position >= message.member.roles.highest.position) return message.channel.error(message, "Kendinle aynı yetkide ya da daha yetkili olan birini susturamazsın!");
    if (!member.manageable) return message.channel.error(message, "Bu üyeyi susturamıyorum!");
    if (conf.penals.chatMute.limit > 0 && muteLimit.has(message.author.id) && muteLimit.get(message.author.id) == conf.penals.chatMute.limit) return message.channel.error(message, "Saatlik susturma sınırına ulaştın!");

    member.roles.add(conf.penals.chatMute.roles);
    const penal = await client.penalize(message.guild.id, member.user.id, "CHAT-MUTE", true, message.author.id, reason, true, Date.now() + duration);
    message.channel.send(embed.setDescription(`${member.toString()} üyesi, ${message.author} tarafından, \`${reason}\` nedeniyle susturuldu! \`(Ceza ID: #${penal.id})\``));
    const time = ms(duration).replace("h", " saat").replace("m", " dakika").replace("s", " saniye");
    if (conf.dmMessages) member.send(`**${message.guild.name}** sunucusunda, **${message.author.tag}** tarafından, **${reason}** sebebiyle, **${time}** boyunca susturuldunuz!`).catch(() => {});

    const log = new MessageEmbed()
      .setAuthor(member.user.username, member.user.avatarURL({ dynamic: true, size: 2048 }))
      .setColor("RED")
      .setDescription(`
${member.toString()} üyesi, \`${time}\` boyunca susturuldu!

Ceza ID: \`#${penal.id}\`
Susturulan Üye: ${member.toString()} \`(${member.user.username.replace(/\`/g, "")} - ${member.user.id})\`
Susturan Yetkili: ${message.author} \`(${message.author.username.replace(/\`/g, "")} - ${message.author.id})\`
Susturma Tarihi: \`${moment(Date.now()).format("LLL")}\`
Susturma Bitiş Tarihi: \`${moment(Date.now() + duration).format("LLL")}\`
Susturma Sebebi: \`${reason}\`
      `);
    message.guild.channels.cache.get(conf.penals.chatMute.log).send(log);

    if (conf.penals.chatMute.limit > 0) {
      if (!muteLimit.has(message.author.id)) muteLimit.set(message.author.id, 1);
      else muteLimit.set(message.author.id, muteLimit.get(message.author.id) + 1);
      setTimeout(() => {
        if (muteLimit.has(message.author.id)) muteLimit.delete(message.author.id);
      }, 1000 * 60 * 60);
    }
  },
};
