'use strict';

/**
 * @author Adam Patterson <awpatterson217@gmail.com>
 */

const util = require('util');
const path = require('path');

const fs = require('fs-extra');
const pm2 = require('pm2');
const {
  Clone: clone
} = require('nodegit');

const File = require('./File');
const {
  makeServerString,
  getVersions
} = require('./utils');

const { sep } = path;

pm2.connectAsync = util.promisify(pm2.connect);
pm2.startAsync = util.promisify(pm2.start);
pm2.listAsync = util.promisify(pm2.list);
pm2.stopAsync = util.promisify(pm2.stop);
pm2.deleteAsync = util.promisify(pm2.delete);
pm2.reloadAsync = util.promisify(pm2.reload);

async function start(id) {
  try {
    await pm2.connectAsync();

    await pm2.startAsync(id);
  } finally {
    await pm2.disconnect();
  }

  return true;
}

async function suspend(id) {
  try {
    await pm2.connectAsync();

    await pm2.stopAsync(id);
  } finally {
    await pm2.disconnect();
  }

  return true;
}

async function remove(id) {
  try {
    await pm2.connectAsync();

    await pm2.deleteAsync(id);
  } finally {
    await pm2.disconnect();
  }

  return true;
}

async function reload(id) {
  try {
    await pm2.connectAsync();

    await pm2.reloadAsync(id);
  } finally {
    await pm2.disconnect();
  }
  
  return true;
}

async function list(id) {
  let list;

  try {
    await pm2.connectAsync();

    list = await pm2.listAsync();
  } finally {
    await pm2.disconnect();
  }

  if (list.length) {
    return list.map((process) => {
      const {
        name,
        pm2_env: {
          status
        }
      } = process;

      return {
        id: name,
        status
      };
    }).filter((process) => {
      return process.id === id;
    })[0];
  }

  return {};
}

async function listAll() {
  let list;

  try {
    await pm2.connectAsync();

    list = await pm2.listAsync();
  } finally {
    await pm2.disconnect();
  }

  if (list.length) {
    return list.map((process) => {
      const {
        name,
        pm2_env: {
          status
        }
      } = process;

      return {
        id: name,
        status
      };
    });
  }

  return [];
}

async function provision({
  host,
  port,
  url,
  name,
  servicesPath,
  tempPath
}) {
  if (!host || !port || !url || !name || !servicesPath || !tempPath) {
    throw new Error('Function provision - missing argument');
  }

  const id = `${name}_server`;
  const servicePath = path.join(servicesPath, name);
  const serverPath = path.join(servicePath, `${id}.js`);
  const outFile = new File(serverPath);

  const source = path.join(tempPath, 'dist', 'app');
  const destination = path.join(servicePath, 'app');

  const data = makeServerString({
    host,
    port
  });

  try {
    await fs.emptydir(servicePath);

    await fs.emptydir(tempPath);

    await clone(url, tempPath);

    await outFile.write({
      data
    });

    await fs.copy(source, destination);

    await pm2.connectAsync();

    await pm2.startAsync(serverPath);

    await fs.remove(tempPath);
  } finally {
    await pm2.disconnect();
  }

  return {
    port,
    host,
    url,
    name,
    id
  };
}

module.exports = {
  provision,
  list,
  listAll,
  reload,
  suspend,
  remove,
  start
};
