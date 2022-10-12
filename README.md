## DiscordBot

Bot was built using github as versioning control. However, this is a new base with sensitive information censored so there will be no history.
**There are several unhandled promise rejections, which will be deprecated in the future, will need to be fixed if updated.**

The bot's features:



General information:
Used version of discord.js@12.5.3

Usage of the bot requires several guild, channel, message, and user IDs to be configured
Also certain roles with specific names need to be configured
Bot was mostly designed with ONE server in mind, multiple servers will cause issues.
To run you need to make a file called config.json in the base directory of the format:
```
{
	"prefix": "!",
	"token": "API_TOKEN"
}
```
Run with: node .
or to debug: node --inspect .
If you add the word "test" afterwords like so: node --inspect . test
It will pull its prefix and token from configTest.json instead
