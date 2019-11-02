'use strict'

const {
  provision,
  list,
  listAll,
  reload,
  suspend,
  remove,
  start
} = require('./src');

const config = require('./config');
const { log } = console;

const {
  temp: {
    path: tempPath
  },
  services: {
    path: servicesPath
  }
} = config;

const optionsOne = {
  url: 'https://github.com/nodegit/nodegit',
  host: '127.0.0.5',
  port: 3000,
  name: 'five',
  servicesPath,
  tempPath
};

const optionsTwo = {
  url: 'https://github.com/nodegit/nodegit',
  host: '127.0.0.8',
  port: 3000,
  name: 'eight',
  servicesPath,
  tempPath
};

provision(optionsOne)
  .then((result) => {
    log('Provision started with options:');
    log(result);

    return result.id;
  })
  .then(suspend)
  .then(() => provision(optionsTwo))
  .then((result) => {
    log('Provision started with options:');
    log(result);
  })
  .then(listAll)
  .then((processes) => {
    if(processes.length) {
      log('Processes info:');
      log(processes);
    } else {
      log('No processes running');
    }
  })
  .catch((error) => {
    console.error(error);
  });
