# [cloudflare-ddns](https://github.com/SrGMC/cloudflare-ddns)

Update DNS entries in Cloudflare and use Cloudflare as a DDNS provider.

## Table of contents

- [cloudflare-ddns](#cloudflare-ddns)
  - [Table of contents](#table-of-contents)
  - [Setup](#setup)
    - [SystemD Service](#systemd-service)
  - [Usage](#usage)
    - [Optional arguments](#optional-arguments)
    - [Schedule](#schedule)
  - [Docker](#docker)
    - [Tags](#tags)
    - [`docker-compose.yaml`](#docker-composeyaml)

## Setup

1. Install [Node.js](https://nodejs.org/en/)
2. Clone this project with `git clone https://github.com/SrGMC/cloudflare-ddns.git`
3. Install the requiered dependencies with `npm install`.
4. Edit `config.json` and change the following:
    - `zone_id`: Zone ID assigned to the Zone you want to update.
    - `zone_name`: The name of the Zone you want to update.
    - `auth_email`: The email used to login into your Cloudflare account.
    - `auth_key`: Your global API key. This can be obtained in **My Profile** > **API Tokens** > **Global API Key**.
    - `records`: The DNS records you want to update. You can add as many as you want:
        - `@` is the root domain.
    - `time` (optional): Interval (in ms) of updates.
    - `bypass` (optional): Set every record as non-proxied.
5. Run the script with `npm start` or `node index.js`

**Note:** `config.json` takes precedence to the optional arguments

### SystemD Service

A SystemD Service file is provided in this repository. The steps to install are the following

1. Copy `cloudflare-ddns.service` to `/etc/systemd/system/cloudflare-ddns.service`
2. Make sure `node` is executed from `/usr/local/bin/node`. This can be checked with `which node`
3. Install the service: `sudo systemctl enable cloudflare-ddns.service`
4. Start the service: `sudo systemctl start cloudflare-ddns.service`

## Usage

```bash
node index.js [-h] [-v] [-t TIME] [-b BYPASS]
```

### Optional arguments

- `-h, --help`: Show help message and exit
- `-v, --version`: Show program's version number and exit
- `-t TIME, --time TIME`: Interval (in ms) of update
- `-b BYPASS, --bypass BYPASS`: Bypass proxy. Set every record as non-proxied

### Schedule

This script is set up to update DNS records every 30 min.

## Docker

This script is available as a Docker container in [`srgmc/cloudflare-ddns`](https://hub.docker.com/r/srgmc/cloudflare-ddns)

### Tags

- `srgmc/cloudflare-ddns:latest`: Latest version
- `srgmc/cloudflare-ddns:armv7l`: Latest version compiled form ARMv7

### `docker-compose.yaml`

```yaml
version: "3"

networks:
    default:
        driver: bridge

services:
    cloudflare-ddns:
        image: srgmc/cloudflare-ddns:latest
        volumes:
            - /path/to/config.json:/usr/src/app/config.json
        restart: unless-stopped
```

Remember to change `/path/to/config.json`, as this is requiered in order to be able to connect and update DNS records.
