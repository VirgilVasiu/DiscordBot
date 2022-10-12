//Assigns role that has high permissions to prevent abuse of user
module.exports = {
    name: 'passageofarms',
    description: 'protect',
    cooldown: 5,
    guildOnly: false,
    args: true,
    usage: '<person>',
    async execute(message, args, client) {
        const guildID = message.guild.id;
        if (guildID != 693704390887866398) {
            return message.reply('This command only works in ASG');
        }

        const member = message.member;

        if (!message.mentions.users.size) {
            return message.reply('You need a target.');
        }

        const taggedUser = message.mentions.members.first();

        //required roles in server
        const role_Admin = member.guild.roles.cache.find(role => role.name === 'Admin');
        const role_Operator = member.guild.roles.cache.find(role => role.name === 'Operator');
        const role_Passage = member.guild.roles.cache.find(role => role.name === 'Passage of Arms');

        //does the caller of the command have these roles
        const user_has_role_Admin = member.roles.cache.some(role => role.name === 'Admin');
        const user_has_role_Operator = member.roles.cache.some(role => role.name === 'Operator');

        if (user_has_role_Admin || user_has_role_Operator || member.id == message.guild.ownerID) {
            if (taggedUser.roles.cache.some(role => role.name === 'Passage of Arms')) {
                await taggedUser.roles.remove(role_Passage).catch(() => { message.channel.send("failure to remove passage of arms") });
                message.channel.send("Passage of Arms removed");
            } else {
                await taggedUser.roles.add(role_Passage).catch(() => { message.channel.send("failure to add passage of arms") });
                message.channel.send("Passage of Arms granted");
            }
        } else {
            return message.reply('You are not authorized to use this command.');
        }
    },
};