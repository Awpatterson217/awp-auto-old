'use strict';

/**
 * @author Adam Patterson <awpatterson217@gmail.com>
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

const getDirectories = ({
  root
}) => {
  // TODO: Make async
  return fs.readdirSync(root, {
      withFileTypes: true
    })
    .filter(obj => obj.isDirectory())
    .map(obj => obj.name)
}

const getVersions = ({
  servicePath
}) => {
  const name = servicePath.split(`${path.sep}`).pop();

  return {
    name,
    versions: getDirectories({
      root: servicePath
    }).map((version) => {
      return {
        number: version,
        rootPath: path.join(servicePath, version)
      };
    }),
    getLatest() {
      return this.versions.sort((a, b) => a.number - b.number).reverse().pop();
    },
    getOne({ number }) {
      return this.versions.find(
        (version) => version.number === number
      );
    },
    getAll() {
      return this.versions;
    }
  };
}

// TODO: Add logger and logger path.
// TODO: Create API to get logs from path (JSON?)
// TODO: Find cleaner solution to browser refresh bug.
// TODO: Send custom error file instead of JSON.
const makeServerString = ({
  host,
  port
}) => `'use strict'

const express = require('express');
const path = require('path');

const app = express();

const appPath = path.join(__dirname, 'www');

app.use(express.static(appPath))

app.use((req, res, next) => {
  res.sendFile(path.join(appPath, 'index.html'));
});

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500)
    .json({
      message: err.message,
      error: {}
    });
});

app.listen(${port}, '${host}', () => {
    console.log('Server listening at ${host}:${port}')
});`;

module.exports = {
  makeServerString,
  getVersions
};

// const servicesPath = path.join(__dirname, 'services');

// const dashboardVersions = getVersions({
//   name: 'dashboard',
//   servicesPath
// });

// console.log(dashboardVersions.getAll());
// console.log(dashboardVersions.getLatest());
// console.log(dashboardVersions.getOne({ number: '1.0.1' }));
