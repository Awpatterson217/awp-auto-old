'use strict';

/**
 * @author Adam Patterson <awpatterson217@gmail.com>
 */

const util = require('util');
const path = require('path');
const { exec, spawn } = require('child_process');

const fs = require('fs-extra');
const pm2 = require('pm2');
const {
  Clone: clone
} = require('nodegit');

const File = require('../file');
const {
  makeServerString,
  getVersions
} = require('../utils');

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
    }).find((process) => {
      return process.id === id;
    });
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
        pm_id,
        pm2_env: {
          status,
          instances,
          pm_out_log_path,
          pm_err_log_path,
          unique_id,
          pm_uptime,
          created_at,
          version,
          node_version,
          versioning: {
            url
          }
        },
        monit: {
          memory,
          cpu
        }
      } = process;

      return {
        name,
        id: pm_id,
        status,
        instances,
        pm_uptime,
        created_at,
        version,
        node_version,
        url,
        memory,
        cpu
      };
    });
  }

  return [];
}

function installNPMModules({ cwd }) {
  console.log(Date().toLocaleString() + '- installNPMMOdules');
  return new Promise(resolve => {
    const child = spawn(
      'npm',
      ['install'],
      {
        cwd,
        detached: true,
        shell: true,
        // stdio: 'pipe'
      }
    );

    const stdoutPath = path.join(cwd, 'npm', 'stdout.txt');
    const stderrPath = path.join(cwd, 'npm', 'stderr.txt');
    child.stdout.pipe(fs.createWriteStream(stdoutPath));
    child.stderr.pipe(fs.createWriteStream(stderrPath));

    // child.stdout.on('data', (data) => {
    //   console.log(`${Date().toLocaleString()} - child stdout:\n${data}`);
    // });

    // child.stderr.on('data', (data) => {
    //   console.error(`${Date().toLocaleString()} - child stderr:\n${data}`);
    // });

    child.on('exit', function (code) {
      console.log(`${Date().toLocaleString()} - child process exited with code ${code.toString()}`);
      resolve('Finished npm install');
    });
  });
}

function buildAngularApp({ cwd }) {
  console.log(Date().toLocaleString() + '- buildAngularApp');

  return new Promise(resolve => {
    const child = spawn(
      'ng',
      ['build', '--prod=true'],
      {
        cwd,
        detached: true,
        shell: true,
        // stdio: 'pipe'
      }
    );

    const stdoutPath = path.join(cwd, 'ng', 'stdout.txt');
    const stderrPath = path.join(cwd, 'ng', 'stderr.txt');
    child.stdout.pipe(fs.createWriteStream(stdoutPath));
    child.stderr.pipe(fs.createWriteStream(stderrPath));

    // child.stdout.on('data', (data) => {
    //   console.log(`${Date().toLocaleString()} - child stdout:\n${data}`);
    // });

    // child.stderr.on('data', (data) => {
    //   console.error(`${Date().toLocaleString()} - child stderr:\n${data}`);
    // });

    child.on('exit', function (code) {
      console.log(`${Date().toLocaleString()} - child process exited with code ${code.toString()}`);
      resolve('Finished npm install');
    });
  });
}

// TODO: Check for existing host and port numbers or throw error?
async function provision({
  host,
  port,
  url,
  servicesPath,
  tempPath,
  instances = 1,
  max_memory_restart = '100M'
}) {
  if (!host || !port || !url || !servicesPath || !tempPath) {
    throw new Error('Function provision - missing argument');
  }

  const jsonFilePath = path.join(tempPath, 'package.json');
  const jsonFile = new File(jsonFilePath);

  let versions;

  try {
    // Ensure an empty temporary directory is ready.
    await fs.emptydir(tempPath);

    // Git clone the web application from repository.
    await clone(url, tempPath);

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

    // Create log directory paths
    const logsDirPath = path.join(servicePath, 'logs');
    const npmLogDirPath = path.join(logsPath, 'npm');
    const nglogDirPath = path.join(logsPath, 'ng');

    const stdoutPath = path.join(logsPath, 'stdout.txt');
    const errorPath = path.join(logsPath, 'error.txt');

    // Create destination path to copy web application contents to.
    const destination = path.join(servicePath, 'www');

    // Create server path based on servicePath.
    const serverPath = path.join(servicePath, 'server.js');
    const serverFile = new File(serverPath);

    // Ensure an empty directory for this service is ready.
    await fs.emptydir(servicePath);

    // Ensure all log directories exist
    await fs.emptydir(servicePath);
    await fs.emptydir(logsDirPath);
    await fs.emptydir(npmLogDirPath);
    await fs.emptydir(nglogDirPath);

    // Build the npm modules.
    await installNPMModules({ cwd: tempPath });

    // Build the web application in the temporary directory.
    await buildAngularApp({ cwd: tempPath });

    versions = getVersions({
      servicePath
    });

    console.log('versions: ', versions.getAll());
    console.log('versions: ', versions);

    // Check that this version does not already exist.
    // TODO
    if (version in versions.getAll()) {
      console.log('version already exists!');
    }

    // Create the Express server.
    await serverFile.write({
      data: makeServerString({
        host,
        port
      })
    });

    // Copy the web application contents.
    await fs.copy(source, destination);

    // Remove temporary directory
    await fs.remove(tempPath);

    // Connect to PM2 Daemon.
    await pm2.connectAsync();

    // Start the web application
    await pm2.startAsync({
      output: stdoutPath,
      error: errorPath,
      script: serverPath,
      name,
      instances,
      max_memory_restart
    });
  } finally {
    await pm2.disconnect();
  }

  // TODO: Version property
  return {
    name: versions.name,
    port,
    host,
    url,
    versions
  };
}

// TODO
// pm2.startup(platform, errback)

module.exports = {
  provision,
  list,
  listAll,
  reload,
  suspend,
  remove,
  start
};
