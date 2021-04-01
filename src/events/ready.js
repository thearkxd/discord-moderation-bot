const client = global.client;
const conf = require("../configs/config.json");
const penals = require("../schemas/penals");
const { MessageEmbed } = require("discord.js");

module.exports = async () => {
  setInterval(async () => {
    const guild = client.guilds.cache.get(conf.guildID);
    if (!guild) return;
    const finishedPenals = await penals.find({ guildID: guild.id, active: true, temp: true, finishDate: { $lte: Date.now() } });
    finishedPenals.forEach(async (x) => {
      const member = guild.members.cache.get(x.userID);
      if (!member) return;
      if (x.type === "CHAT-MUTE") {
        x.active = false;
        await x.save();
        await member.roles.remove(conf.penals.chatMute.roles);
        client.channels.cache.get(conf.penals.chatMute.log).send(new MessageEmbed().setColor("GREEN").setDescription(`${member.toString()} üyesinin susturulması, süresi bittiği için kaldırıldı!`));
      }
      if (x.type === "TEMP-JAIL") {
        x.active = false;
        await x.save();
        await member.setRoles(conf.registration.unregRoles);
        client.channels.cache.get(conf.penals.jail.log).send(new MessageEmbed().setColor("GREEN").setDescription(`${member.toString()} üyesinin jaili, süresi bittiği için kaldırıldı!`));
      } 
      if (x.type === "VOICE-MUTE") {
        if (member.voice.channelID) {
          x.removed = true;
          await x.save();
          if (member.voice.serverMute) member.voice.setMute(false);
        }
        x.active = false;
        await x.save();
        member.roles.remove(conf.penals.voiceMute.roles);
        client.channels.cache.get(conf.penals.voiceMute.log).send(new MessageEmbed().setColor("GREEN").setDescription(`${member.toString()} üyesinin **sesli kanallarda** susuturulması, süresi bittiği için kaldırıldı!`));
      }
    });

    const activePenals = await penals.find({ guildID: guild.id, active: true });
    activePenals.forEach(async (x) => {
      const member = guild.members.cache.get(x.userID);
      if (!member) return;
      if (x.type === "CHAT-MUTE" && !conf.penals.chatMute.roles.some((x) => member.roles.cache.has(x))) return member.roles.add(conf.penals.chatMute.roles);
      if ((x.type === "JAIL" || x.type === "TEMP-JAIL") && !conf.penals.jail.roles.some((x) => member.roles.cache.has(x))) return member.setRoles(conf.penals.jail.roles);
      if (x.type === "VOICE-MUTE") {
        if (!conf.penals.voiceMute.roles.some((x) => member.roles.cache.has(x))) member.roles.add(conf.penals.voiceMute.roles);
        if (member.voice.channelID && !member.voice.serverMute) member.voice.setMute(true);
      }
    });
  }, 1000 * 5);
};

module.exports.conf = {
  name: "ready",
};
