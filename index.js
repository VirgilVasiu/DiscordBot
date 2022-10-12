///////////////////////////////////////////////////Bot Setup/////////////////////////////////////////////////////////////////
const fs = require('fs');
const Discord = require('discord.js');
const debuffList = require('./debuffList.json');

//For seeing arguments
/*
process.argv.forEach(function (val, index, array) {
	console.log(index + ': ' + val);
});*/

var { prefix, token } = require('./config.json');
if (process.argv[2] == 'test') {
	var { prefix, token } = require('./configTest.json');
}

//dynamic command addition
const client = new Discord.Client();
client.commands = new Discord.Collection();

//generate variables
const cooldowns = new Discord.Collection();
client.debufftimers = require('./debuffTime.json'); //Add debuff timers
var deactivated = false;
var deactivated_RNG = false;
var rngProc = false;

//regex
const regex_wow = /((wow)+)/i;
const regex_listen = /((listen)+)/i;
const regex_wow_space = /w{1}\s+o{1}\s+w{1}/i;
const regex_listen_space = /l{1}\s+i{1}\s+s{1}\s+t{1}\s+e{1}\s+n{1}/i;
const regex_why = /wh{1}y+/i;
const regex_user = /(user){1}/i;
const regex_cat = /(cat){1}/i;
const regex_cat1 = /(cat){1}/;
const regex_cat3 = /^(Cat){1}$/;
const regex_cat2 = /(Cat\.){1}/;
const regex_fire = /(fire){1}/i;
const userRole = 'Users';
const stop = /(stop){1}/i;
const start = /(come back){1}/i;
const stop_RNG = /(stop rng){1}/i;
const start_RNG = /(start rng){1}/i;
const status = /(status){1}/i;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	//console.log(command.name);
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}


//Bot start
client.on('ready', () => {
	console.log('Project: Listen is now active');
	const debuffInterval = 900000; //15 minutes in milliseconds
	setInterval(() => { debuffTimer(client, debuffInterval) }, debuffInterval); //Start the process to count down the debuff timers, only works when bot is running (should be 24/7)
});

client.login(token);

/////////////////////////////////////////// Message/Command Handling ////////////////////////////////////////////////////////
client.on('message', async message => {
	///////////NonCommand Message Handling//////////
	if (!message.content.startsWith(prefix)) {
		if (message.author.bot) {//Ignore any bot messages
			return;
		//If the bot is mentioned
		} else if (message.mentions.has(client.user)) { 
			if (stop.test(message.content)) {
				deactivated = true;
				message.channel.send("Sorry :(");
			}
			if (start.test(message.content)) {
				deactivated = false;
				message.channel.send("Welcome back");
			}
			if (stop_RNG.test(message.content)) {
				deactivated_RNG = true;

				let listenauthorized = message.guild.emojis.cache.find(emoji => emoji.name === 'listenauthorized');
				await message.react(listenauthorized);
			}
			if (start_RNG.test(message.content)) {
				deactivated_RNG = false;

				let listenauthorized = message.guild.emojis.cache.find(emoji => emoji.name === 'listenauthorized');
				await message.react(listenauthorized);
			}
			if (status.test(message.content)) {
				var response = "Message responses deactivated: ";
				response += deactivated;
				response += "\nRNG deactivated: ";
				response += deactivated_RNG;
				message.channel.send(response);
			}
		} else {
			//////////Things to do/send on random chance for every message sent//////////
			if (!deactivated_RNG) {
				var rng = getRandomInt(1000);
				var rng2 = getRandomInt(250);
				var rng3 = getRandomInt(250);

				if (rngProc == false) {//Base chance for 'rng' to trigger
					if (rng == 0) {
						message.channel.send(":)");
						rngProc = true;
					}
				} else {
					rng = getRandomInt(15); //If 'rng' has triggered once, change its chance until it is triggered again then reset it
					if (rng == 0) {
						message.channel.send(":)");
						rngProc = false;
					}
				}

				if (rng2 == 0) {
					message.channel.send("Anyone need an extended car warranty?");
				}
				if (rng3 == 0) {
					message.guild.members.fetch('315665092001660929') //Specifically mention one user
						.then(theman => {
							message.channel.send(`${theman.user}, I am contacting you about your car's extended warrenty.`);
						})
						.catch(console.error);
				}
			}
			////////////DM pipeline handling////////////
			if (message.channel.type == 'dm') {
				client.channels.fetch('739624963530555504') //bot_dms TestDiscord
					.then(channel => {
						const buildOutput = () => {
							var output = "";
							output += `**From: ${message.author.tag}**`;

							if (message.content != '') {
								output += "\n```";
								output += message.content;
								output += "```";
							}
							return output;
						}
						const sendfunction = async () => {
							try {
								const output = buildOutput();
								await channel.send(output);
								if (message.attachments.size > 0) {
									for (var object of message.attachments) {
										var object = object[1];
										await channel.send(object.proxyURL);
									}
								}
							} catch {
								errorNotify('Function: DM Pipeline\nError: sending the message', message.guild);
							}
						}
						sendfunction();
					})
					.catch(console.error);
			}
			///////////////special message regex handling/////////////
			if (!deactivated) {
				if (regex_listen.test(message.content)) {
					await message.reply('I am always listening');
				} else if (regex_why.test(message.content)) {
					await userAdd(message).catch(() => { //call the function add the user to the role
						message.channel.send("It looks like I don't have permission to add you to the user clan why");
					});
				} else if (regex_wow.test(message.content)) {
					await message.channel.send("wow wow wow wow");
				} else if (regex_cat.test(message.content)) { //Yes there is a better way to do this. 
					if (regex_cat1.test(message.content)) {
						message.channel.send("cat");
					} else if (regex_cat2.test(message.content)) {
						message.channel.send("Cat.");
					} else if (regex_cat3.test(message.content)) {
						message.channel.send("Cat");
					} else {
						message.channel.send("Cat.");
					}
				} else if (regex_fire.test(message.content)) {
					await message.author.send("https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/SMPTE_Color_Bars.svg/1200px-SMPTE_Color_Bars.svg.png");
				}
			}
			//reaction handling, not deactivated if the message response is
			if (regex_listen_space.test(message.content)) {
				let listenauthorized = message.guild.emojis.cache.find(emoji => emoji.name === 'listenauthorized');
				await message.react(listenauthorized);
			} if (regex_wow_space.test(message.content)) {
				let wow = message.guild.emojis.cache.find(emoji => emoji.name === 'wow');
				await message.react(wow);
			}
			return;
		}
	}

	//////////////////////////////Command Handling////////////////////////////////
	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	//prevent commands in DMs if set to guildOnly
	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	//check for arguments and supply usage
	if (command.args && !args.length) {
		let reply = `You seem to be missing some arguments ${message.author}!`;
		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}
		return message.channel.send(reply);
	}

	//cooldowns
	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	//actual command handling
	try {
		command.execute(message, args, client);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}

});

/////////////// Message Delete event handling /////////////
client.on('messageDelete', async message => {
	// ignore direct messages
	if (!message.guild) return;
	if (message.type === 'PINS_ADD') return;
	const fetchedLogs = await message.guild.fetchAuditLogs({
		limit: 1,
		type: 'MESSAGE_DELETE',
	});
	// Since we only have 1 audit log entry in this collection, we can simply grab the first one
	const deletionLog = fetchedLogs.entries.first();

	// Let's perform a sanity check here and make sure we got *something*
	if (!deletionLog) return console.log(`A message by ${message.author.tag} was deleted, but no relevant audit logs were found.`);

	// We now grab the user object of the person who deleted the message
	// Let us also grab the target of this action to double check things
	const { executor, target } = deletionLog;

	// And now we can update our output with a bit more information
	// We will also run a check to make sure the log we got was for the same author's message
	if (target.id === message.author.id) {
		console.log(`A message by ${message.author.tag} was deleted by ${executor.tag}.`);
	} else {
		console.log(`A message by ${message.author.tag} was deleted.`);
	}

	//archive deleted messages to record channel
	if (message.guild.id != 376183399792246785) {//Ignore testing discord
		client.channels.fetch('723363409243930684') //records ASG
			.then(channel => {
				const buildOutput = () => {
					var output = "";
					if (target.id === message.author.id) {
						output += `__Censored Message__\nAuthor: ${message.author.tag}\nCensor: ${executor.tag}`;
					} else {
						output += `__Deleted Message__\nAuthor: ${message.author.tag}`;
					}
					if (message.content != '') {
						output += "\n```";
						output += message.content;
						output += "```";
					}
					return output;
				}

				const ignoreAuthorized = async () => { //This is used specifically when an admin deletes a message in the archive channel, so you dont have delete messages about deleteing deleted messages :)
					try {
						const executorObject = await message.guild.members.fetch(executor.id);
						const user_has_role_Admin = executorObject.roles.cache.some(role => role.name === 'Admin');
						if (message.channel.id == 723363409243930684 && user_has_role_Admin) {
							console.log('Ignoring deletion.');
							return true;
						} else {
							return false;
						}
					} catch {
						errorNotify('Function: ignoreAuthorized', message.guild);
					}
				}

				const sendfunction = async () => {
					try {
						const isAuthorized = await ignoreAuthorized();
						const output = buildOutput();
						if (isAuthorized) {
							return;
						}
						await channel.send(output);
						if (message.attachments.size > 0) {
							for (var object of message.attachments) {
								var object = object[1];
								await channel.send(object.proxyURL);
							}
						}
					} catch {
						errorNotify('Function: Censor Archiver\nError: sending the message', message.guild);
					}
				}
				sendfunction();
			})
			.catch(console.error);
	}
});

/////////////// Message Edit event handling /////////////
client.on('messageUpdate', async (oldMessage, newMessage) => {

	if (oldMessage.content == newMessage.content) {//If message has not changed, I believe it happens when messages are reacted to or otherwise updated without changing the actual content
		return;
	} else if (oldMessage.channel.id == 723612703058559078) { //ignore leaderboard channel updates
		return;
	}

	//archive edited messages to record channel
	if (oldMessage.guild.id != 376183399792246785) {//Ignore testing discord
		client.channels.fetch('723363409243930684') //records ASG
			.then(channel => {
				const buildOutput = () => {
					var output = "";

					output += `__Edited Message__\nAuthor: ${oldMessage.author.tag}`;

					output += "\nOld Message:```";
					output += oldMessage.content;
					output += "```";

					output += "New Message:```";
					output += newMessage.content;
					output += "```";

					return output;
				}

				const sendfunction = async () => {
					try {
						const output = buildOutput();
						await channel.send(output);
						if (oldMessage.attachments.size > 0) {
							for (var object of oldMessage.attachments) {
								var object = object[1];
								await channel.send(object.proxyURL);
							}
						}
					} catch {
						errorNotify('Function: Edit Archiver\nError: sending the message', oldMessage.guild);
					}
				}
				sendfunction();
			})
			.catch(console.error);
	}
});


/////////////// User joins the server event handling /////////////
client.on('guildMemberAdd', async member => {
	console.log('User ' + member.user.username + ' has joined the server.');
	const role = member.guild.roles.cache.find(role => role.name === 'New User');

	await member.roles.add(role).catch(() => {
		member.guild.owner.send(`Something went wrong with the autorole on user: ${member.user.username}`);
	});
});

/////////////// User leaves the server event handling /////////////
client.on('guildMemberRemove', async member => { //only works with ASG
	console.log('User ' + member.user.username + ' has left the server.');
	var rng = getRandomInt(8);
	client.channels.fetch('865723492921245726')
		.then(channel => {
			const buildOutput = () => {
				var output = "";
				output += "***@";
				output += member.user.username; //Add username to front of message
				output += "*** ";

				if (rng == 0) {
					output += "Message";
				} else if (rng == 1) {
					output += "Message 1";
				} else if (rng == 2) {
					output += "Message 2";
				} else if (rng == 3) {
					output += "Message 3";
				} else if (rng == 4) {
					output += "Message 4";
				} else if (rng == 5) {
					output += "Message 5";
				} else if (rng == 6) {
					output += "Message 6";
				} else if (rng == 7) {
					output += "Message 7";
				}

				return output;
			}
			const sendfunction = async () => {
				try {
					const output = buildOutput();
					await channel.send(output);
				} catch {
					console.log("i am retarded");
				}
			}
			sendfunction();
		})
		.catch(console.error);

});

/////////////// Guildmember Update Event Handling - e.g. new role, removed role, nickname/////////////
client.on('guildMemberUpdate', async (oldMember, newMember) => {
	//check for new role
	const wasuser = oldMember.roles.cache.some(role => role.name === userRole);
	const isuser = newMember.roles.cache.some(role => role.name === userRole);

	const userRole = newMember.guild.roles.cache.find(role => role.name === userRole);

	if (oldMember.nickname != newMember.nickname) {//check if name changed
		const name = newMember.nickname;

		//check if name is related to users
		if (regex_user.test(name) || regex_wow.test(name) || regex_why.test(name)) {
			await newMember.setNickname(name, "Is a user");

			//give user role
			await newMember.roles.add(userRole).catch(() => { newMember.channel.send("Error with adding role") });
		}
	}

	if (isuser) {
		//remove role if nickname doesnt have some variant of user/why
		const name = newMember.nickname;

		//check if their name is NOT related to users/wow/why, if true remove role
		if (!(regex_user.test(name)|| regex_wow.test(name) || regex_why.test(name))) {
			await newMember.roles.remove(userRole).catch(() => { newMember.channel.send("Error with adding role") });
		}
	}
});

/////////////// Presence Update Handling /////////////
client.on('presenceUpdate', (oldPresence, newPresence) => {
	var member = newPresence.member;
	const debuff_debuff2 = newPresence.guild.roles.cache.find(role => role.name === debuffList['debuff2']);
	const debuff_debuff = newPresence.guild.roles.cache.find(role => role.name === debuffList['debuff']);
	//const general_channel = newPresence.guild.channels.cache.find(channel => channel.name === 'actual_test');
	const general_channel = newPresence.guild.channels.cache.find(channel => channel.name === 'general');
	const test = 'Visual Studio Code';
	const Game1 = 'Game1';
	const Game2 = 'Game2';
	const now = Date.now();

	//NOTE: As of the writing of this code the activities collection consists of a game, music, and a custom status. If any of these 3 are changed it will trigger an update on all of them.
	//So checking to ensure that the specific activities have been changed is important. Before there was proper checking, anything and everything would trigger everytime a different song on spotify would change.

	//IMPORTANT: As is, this code WILL trigger when tabbing in and out of a game if another game is open. I found this entertaining so I left it, however it WILL result in spam. A likely fix would be to maintain an
	//independant variable to check against the oldPresence and newPresence.
	if (newPresence.activities.length != 0) {
		var stream = fs.createWriteStream("./presenceLog.txt", { flags: 'a' });//Logging to file
		for (let i = 0; i < newPresence.activities.length; i++) {//iterate through new activities to choose the ones we need
			//////////Game being played/////////
			if (newPresence.activities[i].type == 'PLAYING') {
				if (oldPresence.activities.length != 0) { //Ensure there are any old activities
					let oldPresenceActivity = false;
					for (let j = 0; j < oldPresence.activities.length; j++) {//iterate through old activities and choose playing
						if (oldPresence.activities[j].type == 'PLAYING') {
							if (oldPresence.activities[j].name != newPresence.activities[i].name) { //Ensure that if there are old activities this is a new one
								stream.write(`${member.user.tag},${newPresence.activities[i].type},${newPresence.activities[i].name},${now}\n`); //Log to file and console
								console.log(`${member.user.tag},${newPresence.activities[i].type},${newPresence.activities[i].name},${now}`);
							}
							if (!(oldPresence.activities[j].name == Game1 || oldPresence.activities[j].name == Game2)) {//If the new activity is different and matches a prenamed activity trigger events
								if (newPresence.activities[i].name == Game1 || newPresence.activities[i].name == Game2) {
									addDebuff(member, debuff_debuff2, 'debuff2', 0, 0);
									general_channel.send(`${member}, you are playing ${newPresence.activities[i].name}`);
								}
							}
							oldPresenceActivity = true; //There is specifically a game in the presence data
						} 
					}
					if(oldPresenceActivity == false){//Does all same as above, just if there is no old GAME presence data, there is other kinds of old presence data.
						stream.write(`${member.user.tag},${newPresence.activities[i].type},${newPresence.activities[i].name},${now}\n`);
						console.log(`${member.user.tag},${newPresence.activities[i].type},${newPresence.activities[i].name},${now}`);
						if (newPresence.activities[i].name == Game1 || newPresence.activities[i].name == Game2) {
							addDebuff(member, debuff_debuff2, 'debuff2', 0, 0);
							general_channel.send(`${member}, you are playing ${newPresence.activities[i].name}`);
						}
					}
				} else { //Does all same as above, just if there is no old presence data at all (includes all 3 types).
					stream.write(`${member.user.tag},${newPresence.activities[i].type},${newPresence.activities[i].name},${now}\n`);
					console.log(`${member.user.tag},${newPresence.activities[i].type},${newPresence.activities[i].name},${now}`);
					if (newPresence.activities[i].name == Game1 || newPresence.activities[i].name == Game2) {
						addDebuff(member, debuff_debuff2, 'debuff2', 0, 0);
						general_channel.send(`${member}, you are playing ${newPresence.activities[i].name}`);
					}
				}
			}
			let oldPresenceStatus = false;
			////////Custom status///////
			//All the same as above just for custom status instead of games.
			if (newPresence.activities[i].type == 'CUSTOM_STATUS') {
				if (oldPresence.activities.length != 0) {
					for (let j = 0; j < oldPresence.activities.length; j++) {
						if (oldPresence.activities[j].type == 'CUSTOM_STATUS') {
							if (oldPresence.activities[j].state != newPresence.activities[i].state) {
								stream.write(`${member.user.tag},${newPresence.activities[i].type},${newPresence.activities[i].state},${now}\n`);
								console.log(`${member.user.tag},${newPresence.activities[i].type},${newPresence.activities[i].state},${now}\n`);
							}
							oldPresenceStatus = true;
						}
					}
					if (oldPresenceStatus == false) {
						stream.write(`${member.user.tag},${newPresence.activities[i].type},${newPresence.activities[i].state},${now}\n`);
						console.log(`${member.user.tag},${newPresence.activities[i].type},${newPresence.activities[i].state},${now}\n`);
					}
				} else {
					stream.write(`${member.user.tag},${newPresence.activities[i].type},${newPresence.activities[i].state},${now}\n`);
					console.log(`${member.user.tag},${newPresence.activities[i].type},${newPresence.activities[i].state},${now}\n`);
				}
			}
		}
	}
});

//*****************Functions****************** */

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

let debuffFile = require('./commands/debuff.js');
const debuffTimerAdd = debuffFile.debuffTimerAdd;

function addDebuff(debuffTarget, debuffRole, debuff, upvoteCount, downvoteCount) {
	if (!(debuffTarget.roles.cache.some(role => role.name === debuffList[debuff]))) {
		debuffTarget.roles.add(debuffRole);
		debuffTimerAdd(client, debuffTarget, debuff, upvoteCount, downvoteCount); //add timer to file
	} else {
		debuffTimerAdd(client, debuffTarget, debuff, upvoteCount, downvoteCount); //add timer to file
	}
}

function debuffTimerRemove(client, guild, user, debuff) {
	const debufftimers = client.debufftimers;

	delete debufftimers[guild][user][debuff];

	fs.writeFile('debuffTime.json', JSON.stringify(debufftimers, null, 4), err => {
		if (err) return console.log('debufftimerremove failed');
	});
}

//Debuff timer function
async function debuffTimer(client, debuffInterval) {
	debufftimers = client.debufftimers;
	debuffInterval = debuffInterval / 1000; //convert to seconds from milliseconds
	for (var guild in debufftimers) { //Iterate through all guilds, users, and debuffs stored
		for (var user in debufftimers[guild]) {
			for (var debuff in debufftimers[guild][user]) {
				debufftimers[guild][user][debuff].time -= debuffInterval; //Subtract time from the stored data
				var debuffTime = debufftimers[guild][user][debuff].time;
				if (debuffTime <= 0) {//If less then 0 remove the debuff
					try {
						const guildObject = client.guilds.cache.find(searchGuild => searchGuild.id == guild);
						const target = guildObject.members.cache.find(member => member.id == user)
						const debuffRole = target.guild.roles.cache.find(role => role.name === debuffList[debuff]);

						target.roles.remove(debuffRole);

						debuffTimerRemove(client, guild, user, debuff);
						console.log(`Timer expired: ${target.user.tag} ${debuffRole.name}`);

						if (guild == 693704390887866398) {//ASG
							client.channels.fetch('724410438816890951') //bot channel ASG
								.then(channel => {
									channel.send(`Timer expired: ${target.user.tag} ${debuffRole.name}`);
								})
								.catch(console.error);
						}
					} catch {
						console.log("error with debuffTimer");
					}
				}
				console.log(debuffTime);
			}
		}
	}

	fs.writeFile('./debuffTime.json', JSON.stringify(debufftimers, null, 4), err => {
		if (err) return console.log('debufftimerremove failed');
	});
}

//Add user role to user
async function userAdd(message) {
	await message.channel.send("HELLO USER");
	await message.member.setNickname("user", "Is a user");

	//give user role
	const role = message.guild.roles.cache.find(role => role.name === userRole);
	await message.member.roles.add(role);
}

//notify bot owner and guild owner of errors with functions in index
//NOTE: Not used consistently throughout the code, needs testing for mulitple guilds. 
async function errorNotify(error, guild) {
	try {
		const botOwner = await client.users.resolve('211339931103002624');
		await botOwner.send(`__Error__\n${error}\nGuild: ${guild.name}`);
		console.log(`__Error__\n${error}\nGuild: ${guild.name}`);
		if (botOwner.id != guild.owner.id) {
			await guild.owner.send(`__Error__\n${error}\nPlease make sure you have the required roles/channels created for this function. Message ${botOwner.tag} if you have any questions.`);
			await botOwner.send(`${guild.owner.tag} notified.`);
			console.log(`${guild.owner.tag} notified.`);
		}
	} catch {
		console.log('big problem with errorNotify');
	}
}