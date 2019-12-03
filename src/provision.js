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

// TODO
const File = require('./File');
const {
  makeServerString,
  getVersions
} = require('./utils');

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
    console.log('About to disconnect...');
    await pm2.disconnect();
    console.log('Disconnected');
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

// TODO: Integrate versions
// Strategies:
// - Take version number from package.json
// - Manually pass in version number
// - Automatically increment
// Check for existing version or throw error?
// Check for existing host and port numbers or throw error?
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
  // TODO:
  // const servicePath = path.join(servicesPath, name, version);
  const servicePath = path.join(servicesPath, name);
  const serverPath = path.join(servicePath, `${id}.js`);
  const outFile = new File(serverPath);

  // TODO: Pass in custom sourch path (as opposed to dist/app)
  const source = path.join(tempPath, 'dist', 'app');
  // TODO: Should not change when integrating version numbers
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

    // TODO: Check for existance of tempPath in case of unexpected error?
    await fs.remove(tempPath);
  } finally {
    await pm2.disconnect();
  }

  // TODO: Version property
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
