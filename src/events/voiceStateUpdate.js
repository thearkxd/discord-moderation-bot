const conf = require("../configs/config.json");
const penals = require("../schemas/penals");

module.exports = async (oldState, newState) => {
  if (oldState.channelID && !newState.channelID) return;
  const finishedPenal = await penals.findOne({ guildID: newState.guild.id, userID: newState.id, type: "VOICE-MUTE", removed: false, temp: true, finishDate: { $lte: Date.now() } });
  if (finishedPenal) {
    if (newState.serverMute) newState.setMute(false);
    await newState.member.roles.remove(conf.penals.voiceMute.roles);
    finishedPenal.active = false;
    finishedPenal.removed = true;
    await finishedPenal.save();
  }

  const activePenal = await penals.findOne({ guildID: newState.guild.id, userID: oldState.id, type: "VOICE-MUTE", active: true });
  if (activePenal) {
    if (!newState.serverMute) newState.setMute(true);
    if (!conf.penals.voiceMute.roles.some((x) => newState.member.roles.cache.has(x))) newState.member.roles.add(conf.penals.voiceMute.roles);
  }
};

module.exports.conf = {
  name: "voiceStateUpdate",
};
