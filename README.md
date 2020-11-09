# cloudflare-ddns

Update DNS entries in Cloudflare and use Cloudflare as a DDNS provider.

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
5. Run the script with `./update-dns.sh`

## Usage

```bash
./update-dns.sh [-b | -h]
```

### Optional arguments

- `-b`: Bypass proxy: set all DNS records as non proxied. Useful for renewing certificates.
- `-h`: Show this help message.

### Schedule

This script is set up to update DNS records every 30 min.