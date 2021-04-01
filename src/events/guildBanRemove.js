const { MessageEmbed } = require("discord.js");
const penals = require("../schemas/penals");
const conf = require("../configs/config.json");
const moment = require("moment");
const forceBans = require("../schemas/forceBans");
require("moment-duration-format");
moment.locale("tr");

module.exports = async (guild, user) => {
  if (guild.id !== conf.guildID) return;

  const data = await forceBans.findOne({ guildID: guild.id, userID: user.id });
  if (data) return guild.members.ban(user.id, { reason: "Sunucudan kalıcı olarak yasaklandı!" }).catch(() => {});
  
  let audit = await guild.fetchAuditLogs({ type: 'GUILD_BAN_REMOVE' });
  audit = audit.entries.first();
  if (audit.executor.bot) return;

  const penal = await penals.findOne({ guildID: guild.id, userID: user.id, active: true, type: "BAN" });
  if (penal && penal.active) {
    penal.active = false;
    await penal.save();
  }

  const log = new MessageEmbed()
    .setAuthor(user.username, user.avatarURL({ dynamic: true, size: 2048 }))
    .setColor("GREEN")
    .setDescription(`
\`(${user.username.replace(/\`/g, "")} - ${user.id})\` üyesinin banı kaldırıldı!

Banı Kaldıran Yetkili: ${audit.executor} \`(${audit.executor.username.replace(/\`/g, "")} - ${audit.executor.id})\`
Banın Kaldırılma Tarihi: \`${moment(Date.now()).format("LLL")}\`
      `)
  guild.channels.cache.get(conf.penals.ban.log).send(log);
};

module.exports.conf = {
  name: "guildBanRemove",
};
