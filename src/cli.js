#!/usr/bin/env node
import 'babel-polyfill'
import commander from 'commander'
import path from 'path'
import fs from 'fs'
import app from './app'

// npm run local:cli -- -c /conf.json

commander
  .option('-c, --config <path>', '', './config.json')
  .parse(process.argv);

if (fs.existsSync(commander.config)) {
  const config = require(path.resolve(commander.config));
  app(config)
} else {
  console.error('error: not file config');
}
