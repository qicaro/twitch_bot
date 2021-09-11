
const axios = require("axios");
var qs = require('qs');

const username = process.env.PASTEBIN_USERNAME;
const password = process.env.PASTEBIN_PASSWORD;
const apiDevKey = process.env.PASTEBIN_API_DEV_KEY;


const functions = {
    GetBansFromText: GetBansFromText,

}

async function authenticate() {
    return new Promise(async (resolve, reject) => {
        console.log("Authenticating to Pastebin");

        const config = {
            url: 'https://pastebin.com/api/api_login.php',
            method: 'post',
            data: qs.stringify({
                'api_dev_key': apiDevKey,
                'api_user_name': username,
                'api_user_password': password

            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        }
        await axios.request(config)
            .then(function (response) {
                console.log("Successful authentication: " + response.data);
                resolve(response.data);
            })
            .catch(function (error) {
                console.log("Failed to authenticate");
                reject(error);
            })
    });
}

async function getRawText(url) {
    return new Promise(async (resolve, reject) => {
        authenticate()
            .then(async function (token) {
                console.log("Getting text from pastebin")

                let urlSplitted = url.split("/");
                let pasteKey = urlSplitted[urlSplitted.length - 1];

                var config = {
                    method: 'post',
                    url: 'https://pastebin.com/api/api_post.php',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: qs.stringify({
                        'api_dev_key': apiDevKey,
                        'api_user_key': token,
                        'api_option': 'show_paste',
                        'api_paste_key': pasteKey
                    })
                };

                await axios.request(config)
                    .then(function (response) {
                        console.log("Successful to get text");
                        resolve(response.data)
                    })
                    .catch(function (error) {
                        console.log("Failed to get text");
                        reject(error);
                    })
            })
    });
}
async function GetBansFromText(url) {
    return new Promise(async (resolve, reject) => {
        getRawText(url)
            .then(function (text) {
                let lines = text.split("\r\n");
                let banList = [];
                for (let i = 0; i < lines.length; i++) {
                    banList.push(lines[i].split(" ")[1]);
                }
                resolve(banList);
            });
    });
}

module.exports = functions