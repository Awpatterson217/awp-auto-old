'use strict'

const path = require('path');

module.exports = {
  host: '127.0.0.1',
  port: 3000,
  dashboard: {
    path: path.join(__dirname, 'dashboard', 'dist', 'dashboard')
  },
  services: {
    path: path.join(__dirname, 'services')
  },
  temp: { 
    path: path.join(__dirname, 'temp')
  }
};
