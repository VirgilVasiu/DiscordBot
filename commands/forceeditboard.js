module.exports = {
    name: 'forceeditboard',
    description: 'pass a string to force edit the leaderboard',
    cooldown: 5,
    guildOnly: false,
    args: true,
    usage: '<operation> <string>',
    async execute(message, args, client) {
        const guildID = message.guild.id;
        if (guildID != 693704390887866398) {
            return message.reply('This command only works in ASG');
        }

        const member = message.member;

        //required roles in server
        const role_Admin = member.guild.roles.cache.find(role => role.name === 'Admin');
        const role_Operator = member.guild.roles.cache.find(role => role.name === 'Operator');

        //does the caller of the command have these roles
        const user_has_role_Admin = member.roles.cache.some(role => role.name === 'Admin');
        const user_has_role_Operator = member.roles.cache.some(role => role.name === 'Operator');


        if (user_has_role_Admin || user_has_role_Operator || member.id == message.guild.ownerID) {

            const messageID = '736524916362313739'; //bootleg workaround only works in ASG, directly references the message itself, will need to be edited if message is deleted

            client.channels.fetch('723612703058559078') //As above directly references the channel the message is in, if channel is changed this needs to be updated
                .then(channel => {
                    channel.messages.fetch(messageID).then(leaderboard => {
                        if (args[0] == 'reset') {
                            const send = "Current Leaderboard:\nX - Y | 3-1\nZ - Y | 1-9\nZ - B  | 720-14";
                            console.log("resetting leaderboard");
                            leaderboard.edit(send);
                        } else {
                            const output = args.join(" ");//Whole message is passed in and joined together on the spaces
                            leaderboard.edit(output);//Edit the message with this updated string
                        }
                        const listenauthorized = message.guild.emojis.cache.find(emoji => emoji.name === 'listenauthorized'); //React to the command message to alert user it has been processed
                        message.react(listenauthorized);
                    })
                        .catch(console.error);
                })
                .catch(console.error);
        } else {
            return message.reply('You are not authorized to use this command.');
        }
    },
};