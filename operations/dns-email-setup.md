# DNS & Email Setup — taillagedehaies.ai

## Domain
- **Registrar** : Namecheap (jsleboeuf)
- **Nameservers** : Cloudflare (kara.ns.cloudflare.com, sri.ns.cloudflare.com)
- **Cloudflare Plan** : Free
- **Zone ID** : `3ef5b62650eed7b58746e5de051d3b50`
- **Account** : contact@autoscaleai.ca

## DNS Records

| Type | Name | Value | Priority |
|------|------|-------|----------|
| A | @ | 185.158.133.1 | - |
| A | www | 185.158.133.1 | - |
| MX | @ | linda.mx.cloudflare.net | 1 |
| MX | @ | amir.mx.cloudflare.net | 61 |
| MX | @ | isaac.mx.cloudflare.net | 86 |
| TXT | @ | v=spf1 include:_spf.mx.cloudflare.net ~all | - |
| TXT | _dmarc | v=DMARC1; p=quarantine; rua=mailto:info@taillagedehaies.ai | - |

## Email

- **Provider** : Cloudflare Email Routing (gratuit)
- **Adresse** : info@taillagedehaies.ai
- **Forward** : vers Gmail
- **Warm-up** : non requis (forwarding seulement)

## Namecheap API

- **Endpoint** : https://api.namecheap.com/xml.response
- **ApiUser** : jsleboeuf
- **IPs whitelistees** : 142.169.187.248, 157.157.221.30, 142.169.176.64

## Secrets (Infisical prod)

Tous les credentials sont dans Infisical project `5915781f-9d5a-459e-9cf7-c4663c1e4a1e` env `prod` :
- `NAMECHEAP_API_KEY`, `NAMECHEAP_API_USER`, `NAMECHEAP_USERNAME`
- `NAMECHEAP_SLD`, `NAMECHEAP_TLD`, `NAMECHEAP_API_ENDPOINT`
- `NAMECHEAP_WHITELISTED_IP_1`, `NAMECHEAP_WHITELISTED_IP_2`, `NAMECHEAP_WHITELISTED_IP_3`
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_EMAIL`
- `CLOUDFLARE_ZONE_ID_TAILLAGEDEHAIES`

## Date setup
2026-03-31
