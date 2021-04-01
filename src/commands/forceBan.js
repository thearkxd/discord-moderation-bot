const conf = require("../configs/config.json");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");
moment.locale("tr");
const settings = require("../configs/settings.json");
const forceBans = require("../schemas/forceBans");

module.exports = {
  conf: {
    aliases: ["permaBan", "forceBan", "permaban", "force-ban", "perma-ban"],
    name: "forceban",
    help: "forceban [kullanıcı] [sebep]",
  },

  /**
   * @param { Client } client
   * @param { Message } message
   * @param { Array<String> } args
   */

  run: async (client, message, args, embed) => {
    if (message.guild.owner.id !== message.author.id && !settings.owners.includes(message.author.id)) return;
    if (!args[0]) return message.channel.error(message, "Bir üye belirtmelisin!");
    const user = message.mentions.users.first() || await client.fetchUser(args[0]);
    if (!user) return message.channel.error(message, "Böyle bir kullanıcı bulunamadı!");
    const ban = await forceBans.findOne({ guildID: message.guild.id, userID: user.id });
    if (ban) return message.channel.error(message, "Bu üye zaten banlı!");
    const reason = args.slice(1).join(" ") || "Belirtilmedi!";
    const member = message.guild.members.cache.get(user.id);
    if (!message.member.hasPermission(8) && member && member.roles.highest.position >= message.member.roles.highest.position) return message.channel.send(embed.setDescription("Kendinle aynı yetkide ya da daha yetkili olan birini banlayamazsın!"));
    if (member && !member.bannable) return message.channel.error(message, "Bu üyeyi banlayamıyorum!");
    
    message.guild.members.ban(user.id, { reason }).catch(() => {});
    await new forceBans({ guildID: message.guild.id, userID: user.id, staff: message.author.id }).save();
    const penal = await client.penalize(message.guild.id, user.id, "FORCE-BAN", true, message.author.id, reason);
    const gifs = ["https://media1.tenor.com/images/ed33599ac8db8867ee23bae29b20b0ec/tenor.gif?itemid=14760307", "https://media.giphy.com/media/fe4dDMD2cAU5RfEaCU/giphy.gif", "https://media1.tenor.com/images/4732faf454006e370fa9ec6e53dbf040/tenor.gif?itemid=14678194"];
    message.channel.send(embed.setDescription(`${member ? member.toString() : user.username} üyesi, ${message.author} tarafından, \`${reason}\` nedeniyle **kalıcı olarak** banlandı! \`(Ceza ID: #${penal.id})\``));
    if (conf.dmMessages) user.send(`**${message.guild.name}** sunucusundan, **${message.author.tag}** tarafından, **${reason}** sebebiyle **kalıcı olarak** banlandınız!`).catch(() => {});

    const log = new MessageEmbed()
      .setAuthor(user.username, user.avatarURL({ dynamic: true, size: 2048 }))
      .setColor("RED")
      .setDescription(`
${member ? member.toString() : user.username} üyesi **kalıcı olarak** banlandı!

Ceza ID: \`#${penal.id}\`
Banlanan Üye: ${member ? member.toString() : ""} \`(${user.username.replace(/\`/g, "")} - ${user.id})\`
Banlayan Yetkili: ${message.author} \`(${message.author.username.replace(/\`/g, "")} - ${message.author.id})\`
Ban Tarihi: \`${moment(Date.now()).format("LLL")}\`
Ban Sebebi: \`${reason}\`
      `)
      .setImage(gifs.random())
    message.guild.channels.cache.get(conf.penals.ban.log).send(log);
  },
};
