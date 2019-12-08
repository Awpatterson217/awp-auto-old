'use strict'

const { join } = require('path');

module.exports = {
  localhost: '127.0.0.2',
  localport: 3000,
  activeURL: '127.0.0.2:3000',
  currentVersion: '0.0.0',
  description: 'No description',
  repository: 'https://github.com/Awpatterson217/test-ng-app-two.git',
  log: {
    server: {
      path: join(__dirname, '0.0.0', 'logs', 'server.txt')
    },
    error: {
      path: join(__dirname, '0.0.0', 'logs', 'error.txt')
    }
  }
};