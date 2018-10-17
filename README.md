# XRT provider

## Install

``` bash
npm i -g xrtd-js
```

## Config

``` json
{
  "ipfs": { "host": "localhost", "port": "5001", "protocol": "http" },
  "web3": "http://localhost:8545",
  "robonomics": {
    "account": "0x.................", OR "privateKey": "0x.................",
    "lighthouse": "airalab.lighthouse.1.robonomics.eth",
    "version": 1,
    "model": null
  },
  "isProvider": true,
  "isMiner": false
}
```

## Use

``` bash
xrtd-js -c my-config.json
```
