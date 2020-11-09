const request = require("sync-request");
const fs = require("fs");

var ZONE_ID = "";
var ZONE_NAME = "";
var AUTH_EMAIL = "";
var AUTH_KEY = "";
var records = {};

if (process.argv[2] === "-h") {
    showHelp();
} else if (process.argv.length === 3 && process.argv[2] !== "-b") {
    console.log("Error: Unrecognized argument.\n");
    showHelp();
} else if (process.argv.length >= 4) {
    console.log("Error: Invalid number of arguments.\n");
    showHelp();
}

function showHelp() {
    console.log("Node.js script to update Cloudflare DNS records");
    console.log("Usage: ./update-dns.sh [-b | -h]\n");
    console.log("Optional arguments:");
    console.log(" -b          Bypass proxy: set all DNS records as non proxied.");
    console.log("             Useful for renewing certificates.");
    console.log(" -h          Show this help message");
    process.exit(1);
}

// Global variables
var IP = "";
var bypass = process.argv[2] === "-b" ? true : false;
const API_ENDPOINT = "https://api.cloudflare.com/client/v4/zones" + ZONE_ID;

var recordOptions = {};

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
            var name = result[i].name.replace(ZONE_NAME, "").replace(".", "");
            if (name === "") {
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
    }, 30000);
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

    main();
});
