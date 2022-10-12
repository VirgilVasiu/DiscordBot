//Just used for testing commands, actual word recognition is in the main index file
module.exports = {
    name: 'listen',
    description: 'bot responds to listen',
    cooldown: 5,
    guildOnly: false,
    args: false,
	execute(message, args) {
		message.reply('I am always listening');
	},
};