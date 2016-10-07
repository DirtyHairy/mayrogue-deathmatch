#!/usr/bin/env node

require('babel-register');
require('source-map-support').install();
require('./src/server/main').run();
