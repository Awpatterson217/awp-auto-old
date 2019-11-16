'use strict';

/**
 * @author Adam Patterson <awpatterson217@gmail.com>
 */

const { join } = require('path');

module.exports = {
  host: '127.0.0.1',
  port: 3000,
  dashboard: {
    path: join(__dirname, 'dashboard', 'dist', 'dashboard')
  },
  services: {
    path: join(__dirname, 'services')
  },
  temp: { 
    path: join(__dirname, 'temp')
  },
  log: {
    main: {
      path: join(__dirname, 'logs', 'main.txt')
    },
    error: {
      path: join(__dirname, 'logs', 'error.txt')
    }
  }
};
