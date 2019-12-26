const request = require('sync-request');

/*
 * CHANGE THIS
 */

const ZONE_ID = '[Your Zone ID]';
const ZONE_NAME = '[Your Zone Name]'
const AUTH_EMAIL = '[Your Email]';
const AUTH_KEY = '[Your Cloudflare Global API]';
var records = {
    '@': {'type': 'A', 'proxied': true},
    'subdomain1': {'type': 'A', 'proxied': false},
    'subdomain2': {'type': 'A', 'proxied': true},
}

/*
 * END CHANGE THIS
 */

if (process.argv[2] === '-h'){
    showHelp();
} else if (process.argv.length === 3 && process.argv[2] !== '-b'){
    console.log('Error: Unrecognized argument.\n');
    showHelp();
} else if (process.argv.length >= 4){
    console.log('Error: Invalid number of arguments.\n');
    showHelp();
} 

function showHelp(){
    console.log('Node.js script to update Cloudflare DNS records');
    console.log('Usage: ./update-dns.sh [-b | -h]\n');
    console.log('Optional arguments:')
    console.log(' -b          Bypass proxy: set all DNS records as non proxied.');
    console.log('             Useful for renewing certificates.');
    console.log(' -h          Show this help message');
    process.exit(1);
}

// Global variables
var IP = '';
var bypass = process.argv[2] === '-b' ? true : false;
const API_ENDPOINT = 'https://api.cloudflare.com/client/v4/zones/' + ZONE_ID;

const recordOptions = {
    headers: {
        'X-Auth-Email': AUTH_EMAIL,
        'X-Auth-Key': AUTH_KEY
    }
};


// Get public IP
function getIP() {
    var res = request('GET', 'https://canihazip.com/s');
    if (res.statusCode == 200) {
        IP = res.getBody();
        //console.log("Public IP: " + IP);
    } else {
        console.log('Error: An error has occured while obtaining public IP');
        process.exit(1);
    }
}


// Get DNS records
function getRecords() {
    var res = request('GET', API_ENDPOINT + '/dns_records', recordOptions);
    if (res.statusCode == 200) {
        var result = JSON.parse(res.getBody()).result;
        for (var i = 0; i < result.length; i++) {
            var name = result[i].name.replace(ZONE_NAME, '').replace('.', '');
            if (name === ''){
                name = '@';
            }
            records[name].id = result[i].id;
        }
        //console.log(records);
    } else {
        console.log('Error: An error has occured while obtaining DNS records');
        console.log('See more below:');
        console.log('Status Code:' + response.statusCode);
        console.log(JSON.parse(res.getBody()));
        process.exit(1);
    }
}

function updateRecords(){
    var recordNames = Object.keys(records);
    for (var i = 0; i < recordNames.length; i++) {
        var name = recordNames[i];
        var endpoint = API_ENDPOINT + '/dns_records/' + records[name].id;

        options = {
            headers: {
                'X-Auth-Email': AUTH_EMAIL,
                'X-Auth-Key': AUTH_KEY,
            },
            json: {
                type: records[name].type,
                name: name == '@' ? '' : name,
                content: IP + '',
                ttl: 1,
                proxied: !bypass ? records[name].proxied : false
            }
        }
        var res = request('PUT', endpoint, options);
        if (res.statusCode !== 200) {
            console.log('Error: An error has occured while updating ' + name);
            console.log(JSON.parse(res.getBody()));
        }
    }
}

function main(){
    getIP();
    getRecords();
    updateRecords();
}

main();