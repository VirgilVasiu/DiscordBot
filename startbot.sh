#!/bin/bash
cd /home/pi/DiscordBot
git pull origin master --no-edit
node index.js >> runlog.txt
