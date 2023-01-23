# TON Storage Gateway

TON Storage Gateway is a Node.js application that allows you to retrieve content from [TON Storage](https://ton.org/docs/participate/ton-storage/storage-faq) via the http(s) protocol.

## Overview
- use the path `/gateway/<bag-id>/<file-path>` to view the content of the `<file-path>`;
- use the path `/gateway/files/<bag-id>/<catalog-path>` to view the files and folders of the `<catalog-path>`;
- use the path `/gateway/download/<bag-id>/<file-path>` to request gateway to download the `<file-path>` from `<bag-id>` to local storage (requires authorization);
- use the path `/gateway/remove/<bag-id>` to remove the `<bag-id>` files from local storage (requires authorization);
- use the path `/auth/signin` for admin authentication;
- use the path `/auth/signout` for admin exit.

You can configure the app and change the prefixes in the [src/config.js](src/config.js) file.

## Ready-to-go Docker container
You can install this application with [docker container](https://github.com/kdimentionaltree/ton-storage-docker) or do each step yourself.

## Manual installation

### Install PM2
```bash 
npm install pm2 -g
```

___
### Install the app
```bash
git clone https://github.com/ndatg/tonstorage-gateway.git
cd tonstorage-gateway
npm install
```

___
### Download storage-daemon and storage-daemon-cli
You can download `storage-daemon` and `storage-daemon-cli` for Linux/Windows/MacOS binaries from [TON Auto Builds](https://github.com/ton-blockchain/ton/actions?query=branch%3Atestnet+is%3Asuccess).

___
### Run the storage-daemon
Download the [network configuration file](https://ton.org/docs/develop/howto/network-configs).

Run the `storage-daemon`:
```bash
./storage-daemon -v 3 -C testnet-global.config.json -I <IP>:<PORT> -p <CLI-PORT> -D /var/ton-storage --storage-provider
```
Run `./storage-daemon --help` for details.

___
### Setup the app environment
Create a new `.env` file based on the `.env.example`.
```bash
cp .env.example .env
```

Edit the `.env` file according to your environment.
```js
SERVER_PORT=3000
SERVER_HOST="0.0.0.0"
SERVER_HOSTNAME="domain.ton"

TONSTORAGE_BIN="/root/storage-daemon-cli"
TONSTORAGE_HOST="127.0.0.1:5555"
TONSTORAGE_DATABASE="/var/ton-storage"
TONSTORAGE_TIMEOUT=5000

SESSION_COOKIE_NAME="sid"
SESSION_COOKIE_PASSWORD="password-should-be-32-characters"
SESSION_COOKIE_ISSECURE=false

GITHUB_AUTH_PASSWORD="password-should-be-32-characters"
GITHUB_AUTH_CLIENTID="authcliendid"
GITHUB_AUTH_CLIENTSECRET="authclientsecret"
GITHUB_AUTH_ISSECURE=false
```

Where:
- `SERVER_PORT` - PORT of your http(s) application;
- `SERVER_HOST` - IP address of your http(s) application;
- `SERVER_HOSTNAME` - domain name, used when `disableIP` is enabled in the [src/config.js](src/config.js) file;
- `TONSTORAGE_BIN` - absolute path to `storage-daemon-cli`;
- `TONSTORAGE_HOST` - `<IP>:<CLI-PORT>` of `storage-daemon`;
- `TONSTORAGE_DATABASE` - absolute path to `storage-daemon` database;
- `TONSTORAGE_TIMEOUT` - timeout when calling `storage-daemon`.

The constants below are only used when `whitelistMode` is enabled in the [src/config.js](src/config.js) file:
- `SESSION_COOKIE_NAME` - session name;
- `SESSION_COOKIE_PASSWORD` - cookie password, used to encode the cookie, requires a length of at least 32 characters;
- `SESSION_COOKIE_ISSECURE` - cookie is only send to the server with an encrypted request over the https protocol;
- `GITHUB_AUTH_PASSWORD` - session password, used to encode the session, requires a length of at least 32 characters;
- `GITHUB_AUTH_CLIENTID` - parameter from [GitHub OAuth configuration](https://docs.github.com/en/rest/guides/basics-of-authentication?apiVersion=2022-11-28);
- `GITHUB_AUTH_CLIENTSECRET` - parameter from [GitHub OAuth configuration](https://docs.github.com/en/rest/guides/basics-of-authentication?apiVersion=2022-11-28);
- `GITHUB_AUTH_ISSECURE` - session cookie is only send to the server with an encrypted request over the https protocol.

___
### Configure the app

The configuration can be found in the [src/config.js](src/config.js) file.

___
### Run the app

```bash
npm start
```

Use the following commands to view the app status:
```bash 
pm2 status
pm2 log
```

___
## License

Released under the [MIT License](LICENSE).
