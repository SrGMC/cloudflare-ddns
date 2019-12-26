# cloudflare-ddns

Update DNS entries in Cloudflare and use Cloudflare as a DDNS provider.

## Setup

1. Install [Node.js](https://nodejs.org/en/)
2. Clone this project with `git clone https://github.com/SrGMC/cloudflare-ddns.git`
3. Install the requiered dependencies with `npm install`.
4. Edit `index.js` and change the following:
    - `ZONE_ID`: Zone ID assigned to the Zone you want to update.
    - `ZONE_NAME`: The name of the Zone you want to update.
    - `AUTH_EMAIL`: The email used to login into your Cloudflare account.
    - `AUTH_KEY`: Your global API key. This can be obtained in **My Profile** > **API Tokens** > **Global API Key**.
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

### Cron

You can run this script every 30 minutes by adding the following line in `crontab -e`:

```cron
*/30 * * * * /path/to/cloudflare-ddns/update-dns.sh >/dev/null 2>&1
```

Change `/path/to/cloudflare-ddns` accordingly