require("dotenv").config();
const pasteBin = require("./pastebin");

pasteBin.getBansFromText("https://pastebin.com/raw/gi637rMG");

//import PasteBin from './pastebin.js';

const tmi = require('tmi.js');

const config = {
    connection: {
        reconnect: true
    },
    identity: {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN
    },
    channels: process.env.CHANNELS.split(";")
}

const client = new tmi.Client(config);

client.connect();

client.on('message', async (channel, context, message) => {

    const isMod = context['user-type'] == "mod";

    if (isMod) {

        const commandArguments = message.split(" ");

        if (message.startsWith("!ban ")) {
            console.log("Channels to ban => " + config.channels.length);
            for (let i = 0; i < config.channels.length; i++) {
                let channelToExecute = config.channels[i];
                console.log(process.env.TWITCH_BOT_USERNAME + "is banning " + commandArguments[1] + " at " + channelToExecute + " channel");

                client.ban(channelToExecute, commandArguments[1], "")
                    .then(function () {
                        console.log("Successfully banned " + user.username + " on " + channel + "!");
                    }, function (err) {
                        console.log(err);
                    });
            }
        }
        else if (message.startsWith("!banpastebin ")) {
            pasteBin.getBansFromText(commandArguments[1])
                .then(function (banList) {
                    for (let j = 0; j < config.channels.length; j++) {
                        let channelToExecute = config.channels[j];

                        for (let i = 0; i < banList.length; i++) {
                            client.ban(channelToExecute, banList[i], "")
                                .then(function () {
                                    console.log("Successfully banned " + user.username + " on " + channel + "!");
                                }, function (err) {
                                    console.log(err);
                                });
                        }
                    }
                });
        }
    }
});
