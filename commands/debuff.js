const debuffList = require('../debuffList.json');
const fs = require('fs');

module.exports = {
    name: 'debuff',
    description: 'assign a role that is a debuff',
    cooldown: 1,
    guildOnly: true,
    args: true,
    usage: '<debuff> <user>',
    execute(message, args, client) {
        const debuff = args[0].toLowerCase();

        if (debuff == "list") {
            var debuffString = "";
            for (var debuffid in debuffList) {
                debuffString = debuffString.concat(debuffid, "\n");
            }
            message.channel.send(debuffString);
            return;
        } else if (!message.mentions.users.size) {
            return message.reply('YOU CANT DEBUFF AIR, select a target');
        }

        if (debuff in debuffList) {
            const taggedUser = message.mentions.users.first();

            //Setup reactions to attach to message later
            const upvote = message.guild.emojis.cache.find(emoji => emoji.name === 'upvote');
            const downvote = message.guild.emojis.cache.find(emoji => emoji.name === 'downvote');
            const filter = (reaction) => {
                return ['upvote', 'downvote'].includes(reaction.emoji.name);
            };

            const vote_time = 900000; //15 minutes
            const requiredVotes = 3;
            const maxUsers = 999;

            //Send message, react to it, and pin it
            message.channel.send(`Give ${taggedUser.username} the \'${debuff}\' debuff? ${requiredVotes} needed to pass. (Vote resolves in ${vote_time / 1000} seconds)`).then(async sentReact => {
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
                            message.channel.send(`The council has voted to spare ${taggedUser.username} with a vote of ${upvoteCount}-${downvoteCount}`);
                        } else if (upvoteCount < requiredVotes) {
                            message.channel.send(`The vote to debuff ${taggedUser.username} with ${debuffList[debuff]} failed with Only ${upvoteCount} upvotes out of ${requiredVotes}.`);
                        } else {
                            //Apply the debuff
                            const debuffRole = message.guild.roles.cache.find(role => role.name === debuffList[debuff]);
                            const debuffTarget = message.mentions.members.first();

                            if (!(debuffTarget.roles.cache.some(role => role.name === debuffList[debuff]))) { //Debuff doesnt exist for user, add role and add to file
                                debuffTarget.roles.add(debuffRole);
                                debuffTimerAdd(client, debuffTarget, debuff, upvoteCount, downvoteCount); //add timer to file
                                var totaltimehours = ((client.debufftimers[message.guild.id][taggedUser.id][debuff].time) / 3600).toFixed(); //get time in hours
                                var totaltimedays = (totaltimehours / 24).toFixed(2); //get time in days
                                message.channel.send(`${taggedUser.username} has been given ${debuffRole.name} with a vote of ${upvoteCount}-${downvoteCount} | Time: ${totaltimedays} days (${totaltimehours} hours)`);
                            } else { //User is already debuffed with this debuff, just add time to file
                                debuffTimerAdd(client, debuffTarget, debuff, upvoteCount, downvoteCount); //add timer to file
                                var totaltimehours = ((client.debufftimers[message.guild.id][taggedUser.id][debuff].time) / 3600).toFixed(); //get time in hours
                                var totaltimedays = (totaltimehours / 24).toFixed(2); //get time in days
                                message.channel.send(`${taggedUser.username}'s debuff ${debuffRole.name} has been extended to ${totaltimedays} days (${totaltimehours} hours)`);
                            }
                        }

                        sentReact.unpin().catch(() => console.log('error unpinning'));
                        this.cooldown = 64800; //Set cooldown of debuff command for the user who called it
                    })
                    .catch(collected => {
                        console.log(collected);
                        console.log('awaitReactions failed');
                    });
            });
        } else {
            return message.reply('That is not a valid debuff, remember <debuff> <user>, use !debuff list');
        }
    },
    debuffTimerAdd(client, user, debuff, upvoteCount, downvoteCount) {
        const debufftimers = client.debufftimers;
        const target = user.user.id;
        const guild = user.guild.id;
        var currentDebuffTime = 0;

        if (debufftimers[guild] == undefined) { //guild not in system
            debufftimers[guild] = {
                [target]: {
                    [debuff]: {
                        "time": formula(currentDebuffTime, upvoteCount, downvoteCount)
                    }
                }
            }
        } else if (debufftimers[guild][target] == undefined) { //user not in system
            debufftimers[guild][target] = {
                [debuff]: {
                    "time": formula(currentDebuffTime, upvoteCount, downvoteCount)
                }
            }
        } else if (debufftimers[guild][target][debuff] == undefined) { //debuff not in system
            debufftimers[guild][target][debuff] = {
                "time": formula(currentDebuffTime, upvoteCount, downvoteCount)
            }
        } else {//role already exists, add to time
            currentDebuffTime = debufftimers[guild][target][debuff].time;
            debufftimers[guild][target][debuff].time = formula(currentDebuffTime, upvoteCount, downvoteCount);
        }

        fs.writeFile('./debuffTime.json', JSON.stringify(debufftimers, null, 4), err => {
            if (err) return console.log('debufftimeradd failed');
        });
    },
};

function formula(currentDebuffTime, upvoteCount, downvoteCount) { //A work of art, formula works for intended use case, gets very very strange outside of it.
    const multiplier_time = 0.3;
    var voteratio = Math.pow(upvoteCount + 0.5, 2) - Math.pow(downvoteCount + 0.2, 2.25);
    if (voteratio < 0) { //who knows lol, hopefully this'll do something interesting in an edge case.
        voteratio = Math.sqrt(Math.abs(voteratio));
    }
    if (upvoteCount == 0 && downvoteCount == 0) {
        let one_day = 86400;
        return currentDebuffTime + (one_day * 3);
    } else {
        return currentDebuffTime + Math.round(((86400 * multiplier_time) * voteratio));
    }
}