const debuffList = require('../debuffList.json');
const fs = require('fs');

module.exports = {
    name: 'esuna',
    description: 'clear one random debuff',
    cooldown: 1,
    guildOnly: true,
    args: true,
    usage: '<user>',
    execute(message, args, client) {
        if (!message.mentions.users.size) {
            return message.reply('YOU CANT CURE AIR, select a target');
        }
        const taggedUser = message.mentions.users.first();

        //Setup reactions to attach to message later
        const upvote = message.guild.emojis.cache.find(emoji => emoji.name === 'upvote');
        const downvote = message.guild.emojis.cache.find(emoji => emoji.name === 'downvote');
        const filter = (reaction) => {
            return ['upvote', 'downvote'].includes(reaction.emoji.name);
        };

        const vote_time = 900000; //15 minutes
        const requiredVotes = 5;
        const maxUsers = 999;

        //Send message, react to it, and pin it
        message.channel.send(`Esuna ${taggedUser.username}? ${requiredVotes} needed to pass. (Vote resolves in ${vote_time / 1000} seconds)`).then(async sentReact => {
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
            sentReact.awaitReactions(filter, { maxUsers: maxUsers, time: vote_time })
                .then(collected => {
                    let upvoteCount = parseInt(collected.filter(u => u.emoji.name === 'upvote').map(u => u.count), 10) - 1; //Remove bots vote
                    let downvoteCount = parseInt(collected.filter(u => u.emoji.name === 'downvote').map(u => u.count), 10) - 1;

                    if (isNaN(upvoteCount)) { //for some reason if a user doesnt upvote, it is not registered
                        upvoteCount = 0;
                    } else if (isNaN(downvoteCount)) {
                        downvoteCount = 0;
                    }

                    if (downvoteCount >= upvoteCount) {
                        message.channel.send(`The council has voted to not esuna ${taggedUser.username} with a vote of ${upvoteCount}-${downvoteCount}`);
                    } else if (upvoteCount < requiredVotes) {
                        message.channel.send(`The esuna on ${taggedUser.username} failed. Only ${upvoteCount} upvotes out of ${requiredVotes} were made.`);
                    } else {
                        //Apply the esuna
                        const esunaTarget = message.mentions.members.first();

                        for (var debuff in debuffList) {
                            if (esunaTarget.roles.cache.some(role => role.name === debuffList[debuff])) {
                                const debuffRole = message.guild.roles.cache.find(role => role.name === debuffList[debuff]);
                                esunaTarget.roles.remove(debuffRole);
                                message.channel.send(`${taggedUser.username} has been esuna'd from ${debuffRole.name} with a vote of ${upvoteCount}-${downvoteCount}`);
                                debuffTimerRemove(client, esunaTarget, debuff);
                                break; //this makes only one get removed, simply remove this and it should remove all debuffs
                            }
                        }
                    }

                    sentReact.unpin().catch(() => console.log('error unpinning'));
                    this.cooldown = 64800;
                })
                .catch(collected => {
                    console.log(collected);
                    console.log('awaitReactions Failed');
                });
        });
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