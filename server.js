require("dotenv").config();
const pasteBin = require("./pastebin");

let cacheBanList = [];

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

console.log(client);

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
                    cacheBanList = banList;
                    ExecuteBan(0, 0);
                });
        }
    }
});

function ExecuteBan(indexChannel, indexBanList) {
    let channelToExecute = config.channels[indexChannel];
    if (indexBanList < cacheBanList.length) {
        let userToBan = cacheBanList[indexBanList];
        console.log("Attempt to ban " + userToBan + " at @" + channelToExecute)
        console.log(client.readyState());
        if(client.readyState() == "OPEN"){
            client.ban(channelToExecute, userToBan, "")
            .then(function () {
                console.log("Successfully banned " + userToBan + " on " + channelToExecute + "!");
                ExecuteBan(indexChannel, indexBanList+1);
            }, function (err) {
                console.log("Failed to ban " + userToBan + " on " + channelToExecute + "!");
                console.log(err);
                ExecuteBan(indexChannel, indexBanList+1);
            });
        }
        else{
            ExecuteBan(indexChannel, indexBanList);
        }
    }
    else{
        indexChannel = indexChannel + 1;
        channelToExecute = config.channels[indexChannel];
        console.log("starting bans into " + channelToExecute)
        if (indexChannel < config.channels.length) {
            ExecuteBan(indexChannel, 0);
        }
    }
}
