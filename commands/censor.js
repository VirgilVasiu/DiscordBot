const { GuildMember, GuildMemberManager, GuildMemberRoleManager } = require("discord.js");

module.exports = {
	name: 'censor',
    description: 'remove one users messages and put it in the hidden-archives',
    cooldown: 0,
    guildOnly: true,
    args: true,
    usage: '<user> <amount>',
	execute(message, args) {
        return message.reply('Function is currently disabled.');

        const member = message.member; //just to avoid typing messsage
        
        if(member.roles.cache.some(role => role.name === 'Admin') || member.id == message.guild.ownerID){
                const amount = parseInt(args[1]);
            
            if (!message.mentions.users.size) {
                return message.reply('No censor target selected.');
            }

	        if (isNaN(amount)) {
		            return message.reply('that doesn\'t seem to be a valid number.');
            } else if (amount < 2 || amount > 100) {
                return message.reply('you need to input a number between 2 and 100.');
            }


            const taggedUser = message.mentions.users.first();
            var deletedAmount = 0;
            //Does not work, needs an update to discord.js, .reverse() is not recognized even though documentation says it should work
            /*
            var reverseCache =  message.channel.messages.cache.reverse();
            reverseCache.forEach((msg) =>{ 
                    console.log(msg.content)
                    if(msg.author === taggedUser && deletedAmount != amount){
                        msg.delete();
                        deletedAmount++;
                    }
            })*/
        }else{
            return message.reply('You are not authorized to use this command.');
        }
	},
};