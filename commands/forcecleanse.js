const debuffList = require('../debuffList.json');
module.exports = {
    name: 'forcecleanse',
    description: 'emergency action, only Operators may use and vote',
    cooldown: 0,
    guildOnly: true,
    args: true,
    usage: '<user>',
    execute(message, args, client) {
        const member = message.member;

        //required roles in server
        const role_Admin = member.guild.roles.cache.find(role => role.name === 'Admin');
        const role_Operator = member.guild.roles.cache.find(role => role.name === 'Operator');

        //does the caller of the command have these roles
        const user_has_role_Admin = member.roles.cache.some(role => role.name === 'Admin');
        const user_has_role_Operator = member.roles.cache.some(role => role.name === 'Operator');


        if (user_has_role_Admin || user_has_role_Operator || member.id == message.guild.ownerID) {

            if (!message.mentions.users.size) {
                return message.reply('No cleanse target selected.');
            }

            const taggedUser = message.mentions.users.first();

            //Setup reactions to attach to message later
            const upvote = message.guild.emojis.cache.find(emoji => emoji.name === 'upvote');
            const downvote = message.guild.emojis.cache.find(emoji => emoji.name === 'downvote');

            const filter = (reaction, user) => {
                var checkUser = message.guild.member(user.id); //this was a wild ride to get
                var isAuthorized = checkUser.roles.cache.some(role => role.name === 'Operator');
                return ['upvote', 'downvote'].includes(reaction.emoji.name) && isAuthorized;
            };

            const vote_time = 180000; //3 minutes
            const requiredVotes = 2;

            //Send message, react to it, and pin it
            message.channel.send(`Forcecleanse ${taggedUser.username}? ${requiredVotes} needed to pass. (Vote resolves in ${vote_time / 1000} seconds)`).then(async sentReact => {
                for (emoji of [upvote, downvote]) await sentReact.react(emoji);

                const pinFunction = async () => {
                    try {
                        const pinMessage = await sentReact.pin();
                        const nextMessage = await message.channel.messages.fetch({ after: pinMessage.id });
                        await nextMessage.first().delete();
                    } catch {
                        console.log('Error in pinning message');
                    }
                }
                pinFunction();

                //Wait for reactions until time limit or vote limit is reached
                sentReact.awaitReactions(filter, { maxUsers: 2, time: vote_time }) //only need two users since the bot doesnt count with this filter on
                    .then(collected => {
                        let upvoteCount = parseInt(collected.filter(u => u.emoji.name === 'upvote').map(u => u.count), 10) - 1;//Still have to remove the bot from the actual vote count though
                        let downvoteCount = parseInt(collected.filter(u => u.emoji.name === 'downvote').map(u => u.count), 10) - 1;

                        if (isNaN(upvoteCount)) { //for some reason if a user doesnt upvote, it is not registered
                            upvoteCount = 0;
                        } else if (isNaN(downvoteCount)) {
                            downvoteCount = 0;
                        }

                        if (downvoteCount >= upvoteCount) {
                            message.channel.send(`The council has voted to not esuna ${taggedUser.username} with a vote of ${upvoteCount}-${downvoteCount}`);
                        } else if (upvoteCount < requiredVotes) {
                            message.channel.send(`The force cleanse on ${taggedUser.username} failed. Only ${upvoteCount} upvotes out of ${requiredVotes} were made.`);
                        } else {
                            //Apply the esuna
                            const esunaTarget = message.mentions.members.first();

                            for (var debuff in debuffList) {
                                if (esunaTarget.roles.cache.some(role => role.name === debuffList[debuff])) {
                                    const debuffRole = message.guild.roles.cache.find(role => role.name === debuffList[debuff]);
                                    esunaTarget.roles.remove(debuffRole);
                                    debuffTimerRemove(client, esunaTarget, debuff);
                                    message.channel.send(`${taggedUser.username} has been force cleanse'd from ${debuffRole.name} with a vote of ${upvoteCount}-${downvoteCount}`);
                                }
                            }
                        }

                        sentReact.unpin().catch(() => console.log('error unpinning'));
                    })
                    .catch(collected => {
                        console.log(collected);
                        console.log('awaitReactions Failed')
                    });
            });

        } else {
            //Option to apply debuff if unauthorized use, this doesn't add a timer however so it would be permanent as is
            /*const debuffTarget = message.member;
            const debuffRole = message.guild.roles.cache.find(role => role.name === "Debuff: Debuff");
            message.member.roles.add(debuffRole);
            */
            return message.reply('You are not authorized to use this command.');
        }
    },
};

function debuffTimerRemove(client, user, debuff) {
    const debufftimers = client.debufftimers;
    const target = user.user.id;
    const guild = user.guild.id;

    delete debufftimers[guild][target][debuff];

    fs.writeFile('./debuffTime.json', JSON.stringify(debufftimers, null, 4), err => {
        if (err) return console.log('debufftimerremove failed');
    });
}