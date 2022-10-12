const Discord = require('discord.js');

module.exports = {
    name: 'leaderboard',
    description: 'update the leaderboard',
    cooldown: 5,
    guildOnly: true,
    args: true,
    usage: '<user> <user> <win/lose> <win/lose>',
    async execute(message, args, client) {
        const guildID = message.guild.id;
        if (guildID != 693704390887866398) {
            return message.reply('This command only works in ASG');
        }

        if(message.mentions.users.size){
            return message.reply('Please do not mention the user, use a nickname.');
        }

        const regex_status = /^((win)|(lose)){1}$/i;

        const status_first = args[2];
        const status_second = args[3];

        if (!(regex_status.test(status_first) || regex_status.test(status_second))) {
            return message.reply('that doesn\'t seem to be a valid input. You must put win lose or lose win.');
        }

        const user_first = args[0].toLowerCase();//make sure capitalization is ignored
        const user_second = args[1].toLowerCase();

        const messageID = '736524916362313739'; //bootleg workaround only works in ASG, directly references the message itself, will need to be edited if message is deleted
        client.channels.fetch('723612703058559078')
            .then(channel => {
                //primerMessage(channel); //Used once when function is first setup in the server, must set messageID after
                channel.messages.fetch(messageID).then(messageBoard => {
                    var split = messageBoard.content.split('\n');

                    var matchup = new Array(split.length);
                    var score = new Array(split.length);
                    for (var i = 0; i < matchup.length; i++) { //initialize arrays
                        matchup[i] = [];
                        score[i] = [];
                    }

                    for (i = 1; i < split.length; i++) { //fill with data from message
                        var n = i - 1;
                        var split2 = split[i].split('|');
                        var person = split2[0].split('-');
                        var splitscore = split2[1].split('-');
                        for (j = 0; j < 2; j++) { //Remove whitespace
                            person[j] = person[j].trim();
                            splitscore[j] = splitscore[j].trim();
                        }
                        matchup[n][0] = person[0].toLowerCase();//make sure capitalization is ignored
                        matchup[n][1] = person[1].toLowerCase();
                        score[n][0] = splitscore[0];
                        score[n][1] = splitscore[1];
                    }
                    //Arrays are 2D with the first dimension being the unique entry, and the second having a 0 to represent the first person and a 1 to represent the second person

                    var matchIndex = -1;

                    //Find the entry to modify in the array
                    for (i = 0; i < matchup.length; i++) {
                        var person1 = matchup[i][0];
                        var person2 = matchup[i][1];
                        var user1 = user_first;
                        var user2 = user_second;
                        var score1 = score[i][0];
                        var score2 = score[i][1];

                        if ((user1 == person1 && user2 == person2) || (user1 == person2 && user2 == person1)) {
                            matchIndex = i; //matchIndex is used later to know the entry to modify
                            break;
                        }
                    }

                    //Use matchIndex to determine if an entry exists or a new one needs to be made
                    var newRecord = false;
                    if(matchIndex == -1){
                        matchIndex = matchup.length - 1;
                        newRecord = true;
                    }

                    var person1 = matchup[matchIndex][0];
                    var person2 = matchup[matchIndex][1];
                    var user1 = user_first;
                    var user2 = user_second;

                    //Initialize score on new record
                    if(newRecord){
                        matchup[matchIndex][0] = user1;
                        matchup[matchIndex][1] = user2;
                        if(status_first == 'win'){
                            score[matchIndex][0] = 1;
                            score[matchIndex][1] = 0;
                        }else{
                            score[matchIndex][0] = 0;
                            score[matchIndex][1] = 1;
                        }
                    //Increment score on existing record
                    }else if(user1 == person1){
                        if(status_first == 'win'){
                            score[matchIndex][0]++;
                        }else{
                            score[matchIndex][1]++;
                        }
                    }else if(user1 == person2){
                        if(status_first == 'win'){
                            score[matchIndex][1]++;
                        }else{
                            score[matchIndex][0]++;
                        }
                    }

                    //Rebuild message
                    var outputMessage = "Current Leaderboard:\n";
                    var combine = matchup.length-1;
                    if(newRecord){
                        combine = matchup.length;
                    }
                    for (var i = 0; i < combine; i++) {
                        outputMessage += matchup[i][0];
                        outputMessage += " - ";
                        outputMessage += matchup[i][1];
                        outputMessage += " | ";
                        outputMessage += score[i][0];
                        outputMessage += "-";
                        outputMessage += score[i][1];
                        outputMessage += "\n";
                    }

                    messageBoard.edit(outputMessage);
                    message.channel.send("Leadboard updated.");
                })
                    .catch(console.error);
            })
            .catch(console.error);

        return;
    },
};

function primerMessage(channel) {
    const send = "Current Leaderboard:\nX - Y | 3-1\nZ - Y | 1-9\nZ - B  | 720-14";
    channel.send(send);
}