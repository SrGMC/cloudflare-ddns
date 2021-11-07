const request = require("sync-request");
const fs = require("fs");
const { ArgumentParser } = require('argparse');
const { version } = require('./package.json');

// Variables

// Config
var ZONE_ID = "";
var ZONE_NAME = "";
var AUTH_EMAIL = "";
var AUTH_KEY = "";
var records = {};
var updateTime = 1800000;
var bypass = false;

// Requests
var IP = "";
const API_ENDPOINT = "https://api.cloudflare.com/client/v4/zones" + ZONE_ID;
var recordOptions = {};

// Argument parser
const parser = new ArgumentParser({
    description: 'Node.js program to update Cloudflare DNS records \n By Álvaro Galisteo (https://alvaro.galisteo.me)'
});

parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('-t', '--time', { help: 'Interval (in ms) of update' });
parser.add_argument('-b', '--bypass', { help: 'Bypass proxy. Set every record as non-proxied' });

var args = parser.parse_args()

updateTime = args.time ? args.time : updateTime;
bypass = args.bypass ? args.bypass : bypass;

// Get public IP
function getIP() {
    var res = request("GET", "https://api.ipify.org?format=json");
    if (res.statusCode == 200) {
        IP = JSON.parse(res.getBody()).ip;
        //console.log("Public IP: " + IP);
    } else {
        console.log("Error: An error has occured while obtaining public IP");
        process.exit(1);
    }
}

// Get DNS records
function getRecords() {
    recordOptions = {
        headers: {
            "X-Auth-Email": AUTH_EMAIL,
            "X-Auth-Key": AUTH_KEY,
        },
    };

    var res = request("GET", API_ENDPOINT + "/" + ZONE_ID + "/dns_records", recordOptions);
    if (res.statusCode == 200) {
        var result = JSON.parse(res.getBody()).result;

        for (var i = 0; i < result.length; i++) {
            var name = result[i].name.replace("." + ZONE_NAME, "");
            if (name === ZONE_NAME) {
                name = "@";
            }

            if (records[name]) {
                records[name].id = result[i].id;
            }
        }
        //console.log(records);
    } else {
        console.log("Error: An error has occured while obtaining DNS records");
        console.log("See more below:");
        console.log("Status Code:" + res.statusCode);
        console.log(JSON.parse(res.getBody()));
        process.exit(1);
    }
}

function updateRecords() {
    var recordNames = Object.keys(records);
    for (var i = 0; i < recordNames.length; i++) {
        var name = recordNames[i];
        var endpoint = API_ENDPOINT + "/" + ZONE_ID + "/dns_records/" + records[name].id;

        options = {
            headers: {
                "X-Auth-Email": AUTH_EMAIL,
                "X-Auth-Key": AUTH_KEY,
            },
            json: {
                type: records[name].type,
                name: name == "@" ? "" : name,
                content: IP + "",
                ttl: 1,
                proxied: !bypass ? records[name].proxied : false,
            },
        };
        var res = request("PUT", endpoint, options);
        if (res.statusCode !== 200) {
            console.log("Error: An error has occured while updating " + name);
            console.log(JSON.parse(res.getBody()));
        }
    }
}

function main() {
    getIP();
    getRecords();
    updateRecords();
    console.log("Updated successfully");

    setInterval(function () {
        getIP();
        getRecords();
        updateRecords();
        console.log("Updated successfully");
    }, updateTime);
}

fs.readFile("./config.json", "utf8", function (err, data) {
    if (err) {
        process.exit(1);
    }

    var config = JSON.parse(data);
    ZONE_ID = config.zone_id;
    ZONE_NAME = config.zone_name;
    AUTH_EMAIL = config.auth_email;
    AUTH_KEY = config.auth_key;
    records = config.records;

    updateTime = config.time ? config.time : updateTime;
    bypass = config.bypass ? config.bypass : bypass;

    main();
});
