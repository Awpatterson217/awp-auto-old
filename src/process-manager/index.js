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
  getVersions,
  makeConfigString
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

async function listAll({ servicesPath }) {
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
          unstable_restarts,
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

      let thisVersion = null;
      let thisDesc = null;
      let thisActiveURL = null;
      let ThisRepository = null;

      if (name !== 'awp-auto-server') {
        // Get local configuration information
        const servicePath = path.join(servicesPath, name, 'config.js');
        const localConfig = require(servicePath);

        thisActiveURL = localConfig.activeURL;
        thisDesc = localConfig.description;
        thisVersion = localConfig.currentVersion;
        ThisRepository = localConfig.repository;
      } else {
        thisActiveURL = '127.0.0.1:3000';
        thisDesc = 'Custom Automation Server';
        thisVersion = version;
        ThisRepository = url;
      }

      return {
        name,
        id: pm_id,
        status,
        instances,
        pm_uptime,
        created_at,
        node_version,
        memory,
        cpu,
        unstableRestarts: unstable_restarts,
        version: thisVersion,
        activeURL: thisActiveURL,
        description: thisDesc,
        repository: ThisRepository
      };
    });
  }

  return [];
}

function installNPMModules({ cwd, npmLogDirPath }) {
  console.log(Date().toLocaleString() + '- installNPMMOdules');

  return new Promise(resolve => {
    const child = spawn(
      'npm install',
      {
        cwd,
        detached: true,
        shell: true,
        // stdio: 'pipe'
      }
    );

    const stdoutPath = path.join(npmLogDirPath, 'stdout.txt');
    const stderrPath = path.join(npmLogDirPath, 'stderr.txt');

    child.stdout.pipe(fs.createWriteStream(stdoutPath));
    child.stderr.pipe(fs.createWriteStream(stderrPath));

    child.on('exit', function (code) {
      console.log(`${Date().toLocaleString()} - child process exited with code ${code.toString()}`);
      resolve('Finished npm install');
    });
  });
}

function buildAngularApp({ cwd, ngLogDirPath }) {
  console.log(Date().toLocaleString() + ' - buildAngularApp');

  return new Promise(resolve => {
    const child = spawn(
      'ng build --prod=true',
      {
        cwd,
        detached: true,
        shell: true,
        // stdio: 'pipe'
      }
    );

    const stdoutPath = path.join(ngLogDirPath, 'stdout.txt');
    const stderrPath = path.join(ngLogDirPath, 'stderr.txt');

    child.stdout.pipe(fs.createWriteStream(stdoutPath));
    child.stderr.pipe(fs.createWriteStream(stderrPath));

    child.on('exit', function (code) {
      console.log(`${Date().toLocaleString()} - child process exited with code ${code.toString()}`);

      resolve('Finished ng build --prod=true');
    });
  });
}

// TODO
// Thrown errors should be caught with updateApplication().catch()
async function updateApplication({
  name,
  id,
  currentVersion
}) {

  try {
    versions = getVersions({
      servicePath
    });

    console.log('versions: ', versions.getAll());
    console.log('versions: ', versions);

    // TODO
    if (version in versions.getAll()) {
      console.log('version already exists!');
    }

    makeConfigString();
  } finally {

  }
}

// TODO: Check for existing application
// otherwise updateApplication should be used instead.
// Thrown errors should be caught with provision().catch()
async function provision({
  host,
  port,
  repository,
  servicesPath,
  tempPath,
  activeURL,
  // TODO: irrelevant unless in cluster mode
  instances = 1,
  maxMemoryUsage = '100M'
}) {
  if (!host || !port || !repository || !servicesPath || !tempPath) {
    throw new Error('Function provision - missing argument');
  }

  const jsonFilePath = path.join(tempPath, 'package.json');
  const jsonFile = new File(jsonFilePath);

  try {
    // Ensure an empty temporary directory is ready.
    await fs.emptydir(tempPath);

    // Git clone the web application from repository.
    await clone(repository, tempPath);

    // Read the package.json
    const packageJSON = await jsonFile.read();

    // Get some useful information from package.json
    const {
      version,
      name,
      description = 'No description'
    } = JSON.parse(packageJSON);

    // Find source path based on project name.
    const source = path.join(tempPath, 'dist', name);

    // Create service path based on project name and version number.
    const servicePath = path.join(servicesPath, name);
    const versionPath = path.join(servicesPath, name, version);

    // Create log directory paths
    const logsDirPath = path.join(versionPath, 'logs');
    const installLogsDirPath = path.join(logsDirPath, 'install');
    const pmLogsDirPath = path.join(logsDirPath, 'pm');
    const npmLogDirPath = path.join(logsDirPath, 'install', 'npm');
    const ngLogDirPath = path.join(logsDirPath, 'install', 'ng');

    const pmServerLogsPath = path.join(pmLogsDirPath, 'server.txt');
    const pmErrorLogsPath = path.join(pmLogsDirPath, 'error.txt');

    // Create destination path to copy web application contents to.
    const destination = path.join(versionPath, 'www');

    // Create server path based on servicePath.
    const serverPath = path.join(servicePath, 'server.js');
    const serverFile = new File(serverPath);

    const configPath = path.join(servicePath, 'config.js');
    const configFile = new File(configPath);

    // Ensure this application does not already exist before proceeding
    if (fs.existsSync(servicePath)) {
      console.log('Application already exists!');
      // throw new Error('Application already exists!');
    }

    // Ensure an empty directory for this service is ready.
    // await fs.emptydir(servicePath);

    // Ensure all directories exist
    await fs.emptydir(versionPath);
    await fs.emptydir(logsDirPath);
    await fs.emptydir(installLogsDirPath);
    await fs.emptydir(pmLogsDirPath);
    await fs.emptydir(npmLogDirPath);
    await fs.emptydir(ngLogDirPath);

    // Build the npm modules.
    await installNPMModules({ cwd: tempPath, npmLogDirPath });

    // Build the web application in the temporary directory.
    await buildAngularApp({ cwd: tempPath, ngLogDirPath });

    // Create the Express server.
    await serverFile.write({
      data: makeServerString({
        host,
        port,
        version
      })
    });

    // Create the config gile
    await configFile.write({
      data: makeConfigString({
        localhost: host,
        localport: port,
        currentVersion: version,
        description,
        activeURL,
        repository
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
      output: pmServerLogsPath,
      error: pmErrorLogsPath,
      script: serverPath,
      name,
      instances,
      max_memory_restart: maxMemoryUsage
    });
  } finally {
    await pm2.disconnect();
  }

  return true;
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
