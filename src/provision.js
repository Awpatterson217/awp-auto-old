'use strict';

/**
 * @author Adam Patterson <awpatterson217@gmail.com>
 */

const util = require('util');
const path = require('path');
const { exec } = require('child_process');

const fs = require('fs-extra');
const pm2 = require('pm2');
const {
  Clone: clone
} = require('nodegit');

const File = require('./file');
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

const execAsync = util.promisify(exec);

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

// TODO: Check for existing host and port numbers or throw error?
async function provision({
  host,
  port,
  url,
  servicesPath,
  tempPath,
  instances = 1
}) {
  if (!host || !port || !url || !servicesPath || !tempPath) {
    throw new Error('Function provision - missing argument');
  }

  const jsonFilePath = path.join(tempPath, 'package.json');
  const jsonFile = new File(jsonFilePath);

  try {
    // Ensure an empty temporary directory is ready.
    await fs.emptydir(tempPath);

    // Git clone the web application from repository.
    await clone(url, tempPath);

    // TODO: 'ng serve --prod="true"'
    // Build the web application in the temporary directory.
    const { stdout, stderr } = await execAsync(
      'ng serve',
      { cwd: tempPath }
    );

    console.log('stdout:', stdout);
    console.log('stderr:', stderr);

    // Read the package.json
    const packageJSON = await jsonFile.read();

    // Get some useful information from package.json
    const {
      version,
      name,
      description
    } = JSON.parse(packageJSON);

    // Find source path based on project name.
    const source = path.join(tempPath, 'dist', name);

    // Create service path based on project name and version number.
    const servicePath = path.join(servicesPath, name, version);

    // Create log paths (use Winston?).
    const stdoutPath = path.join(servicePath, 'stdout');
    const errorPath = path.join(servicesPath, 'error');

    // Create destination path to copy web application contents to.
    const destination = path.join(servicePath, 'www');

    // Create server path based on servicePath.
    const serverPath = path.join(servicePath, 'server.js');
    const serverFile = new File(serverPath);

    // Check that this version does not already exist.
    getVersions({
      servicePath
    });

    // Ensure an empty directory for this service is ready.
    await fs.emptydir(servicePath);

    // Create the Express server.
    await serverFile.write({
      data: makeServerString({
        host,
        port
      })
    });

    // Copy the web application contents.
    await fs.copy(source, destination);

    // Connect to PM2 Daemon.
    await pm2.connectAsync();

    // Start the web application
    await pm2.startAsync({
      output: stdoutPath,
      error: errorPath,
      script: serverPath,
      name,
      instances
    });

    // Remove temporary directory
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
