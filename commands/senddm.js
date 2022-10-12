const { Channel } = require("discord.js");

module.exports = {
    name: 'senddm',
    description: '',
    aliases: [''],
    guildOnly: true,
    cooldown: 0,
    args: true,
    usage: '<userid> <message>',
    async execute(message, args, client) {
        const member = message.member;//just to avoid typing messsage

        const userid = args.shift();
        const output = args.join(" ");

        if (member.roles.cache.some(role => role.name === 'Admin') || member.id == message.guild.ownerID) {
            const user = client.users.cache.find(user => user.id == userid);
            if(user == undefined){
                return message.channel.send('Unable to find user.');
            }
            user.send(output);
            let listenauthorized = message.guild.emojis.cache.find(emoji => emoji.name === 'listenauthorized');
            await message.react(listenauthorized).catch(() => message.channel.send("Acknowledged."));

            client.channels.fetch('739624963530555504') //bot_dms TestDiscord, Specifically this is a private channel that the dms sent and recieved will be stored in 
                .then(channel => {
                    const buildOuput = () => { //Basic formatting of messages
                        var output_channel = "";
                        output_channel += "--------------------------------\n";
                        output_channel += `To: ${user.tag}`;

                        if (output != '') {
                            output_channel += "\n```";
                            output_channel += output;
                            output_channel += "```";
                        }
                        output_channel += "--------------------------------";

                        return output_channel;
                    }
                    const sendfunction = async () => {
                        try {
                            const output_channel = buildOuput();
                            await channel.send(output_channel);
                            //Add image functionality. Update discord.js first, I believe there are new ways attachments are handled now.
                            /* 	if (message.attachments.size > 0) {
                                    for (var object of message.attachments) {
                                        var object = object[1];
                                        await channel.send(object.proxyURL);
                                    }
                                } */
                        } catch{
                            errorNotify('Function: DM Pipeline SendDM\nError: sending the message', message.guild); //Error notify function in index.js
                        }
                    }
                    sendfunction();
                })
                .catch(console.error);
        } else {
            return message.reply('You are not authorized to use this command.');
        }
    },
};