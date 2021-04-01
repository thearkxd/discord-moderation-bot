const conf = require("../configs/config.json");

module.exports = async (oldState, newState) => {
const channel = newState.guild.channels.cache.get(conf.logs.voiceLog);
if (!channel) return;
if (!oldState.channel && newState.channel) return channel.send(`${newState.member.displayName} üyesi \`${newState.channel.name}\` adlı sesli kanala girdi!`);
if (oldState.channel && !newState.channel) return channel.send(`${newState.member.displayName} üyesi \`${oldState.channel.name}\` adlı sesli kanaldan ayrıldı!`);
if (oldState.channel.id && newState.channel.id && oldState.channel.id != newState.channel.id) return channel.send(`${newState.member.displayName} üyesi ses kanalını değiştirdi! (\`${oldState.channel.name}\` => \`${newState.channel.name}\`)`);
if (oldState.channel.id && oldState.selfMute && !newState.selfMute) return channel.send(`${newState.member.displayName} üyesi \`${newState.channel.name}\` adlı sesli kanalda kendi susturmasını kaldırdı!`);
if (oldState.channel.id && !oldState.selfMute && newState.selfMute) return channel.send(`${newState.member.displayName} üyesi \`${newState.channel.name}\` adlı sesli kanalda kendini susturdu!`);
if (oldState.channel.id && oldState.selfDeaf && !newState.selfDeaf) return channel.send(`${newState.member.displayName} üyesi \`${newState.channel.name}\` adlı sesli kanalda kendi sağırlaştırmasını kaldırdı!`);
if (oldState.channel.id && !oldState.selfDeaf && newState.selfDeaf) return channel.send(`${newState.member.displayName} üyesi \`${newState.channel.name}\` adlı sesli kanalda kendini sağırlaştırdı!`);
if (oldState.channel.id && !oldState.streaming && newState.channel.id && newState.streaming) return channel.send(`${newState.member.displayName} üyesi \`${newState.channel.name}\` adlı sesli kanalda yayın açtı!`)
if (oldState.channel.id && oldState.streaming && newState.channel.id && !newState.streaming) return channel.send(`${newState.member.displayName} üyesi \`${newState.channel.name}\` adlı sesli kanalda yayını kapattı!`)
if (oldState.channel.id && !oldState.selfVideo && newState.channel.id && newState.selfVideo) return channel.send(`${newState.member.displayName} üyesi \`${newState.channel.name}\` adlı sesli kanalda kamerasını açtı!`)
if (oldState.channel.id && oldState.selfVideo && newState.channel.id && !newState.selfVideo) return channel.send(`${newState.member.displayName} üyesi \`${newState.channel.name}\` adlı sesli kanalda kamerasını kapattı!`)
};

module.exports.conf = {
  name: "voiceStateUpdate",
};
