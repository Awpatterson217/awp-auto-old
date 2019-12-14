'use strict'

const { join } = require('path');

module.exports = {
  localhost: '127.0.0.5',
  localport: 3000,
  activeURL: '127.0.0.5:3000',
  currentVersion: '0.0.0',
  description: 'No description',
  repository: 'https://github.com/Awpatterson217/test-ng-app-four.git',
  log: {
    server: {
      path: join(__dirname, '0.0.0', 'logs', 'server.txt')
    },
    error: {
      path: join(__dirname, '0.0.0', 'logs', 'error.txt')
    }
  }
};