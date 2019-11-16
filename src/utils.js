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
  return fs.readdirSync(root, {
      withFileTypes: true
    })
    .filter(obj => obj.isDirectory())
    .map(obj => obj.name)
}

const getVersions = ({
  servicesPath,
  name
}) => {
  if (!name) {
    throw new Error('getVersions - no name parameter');
  }

  const trimmedName = name.toLowerCase().trim();

  const root = path.join(servicesPath, trimmedName);

  return {
    name: trimmedName,
    versions: getDirectories({
      root
    }).map((version) => {
      return {
        number: version,
        rootPath: path.join(root, version),
        appPath: path.join(root, version, 'dist', trimmedName)
      };
    }),
    getLatest() {
      return this.versions.sort().reverse()[0];
    },
    getOne({
      number
    }) {
      return this.versions.filter(
        (version) => version.number === number
      );
    },
    getAll() {
      return this.versions;
    }
  };
}

const makeServerString = ({ host, port }) => `'use strict'

const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'app')))

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
    console.log('Test express server listening at ${host}:${port}')
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

// // console.log(dashboardVersions.getAll());
// console.log(dashboardVersions.getLatest());
// console.log(dashboardVersions.getOne({ number: '1.0.1' }));
