'use strict';

/**
 * @author Adam Patterson <awpatterson217@gmail.com>
 */

const express = require('express');
const winston = require('winston');

const APIs = require('./src/api');
const config = require('./config');

const app = express();

app.use(express.json());

/**
 * TODO:
 * - Authentication API and UI.
 * - Login UIs
 * - Unique, generated paths that only exists for the duration of the session.
 * - Add provision tab to dashboard.
 * - Add dedicated database to manage login information.
 * - Automate installation.
 * - Add GIT repo, version number, and option to update the
 * web application for each listed server in dashboard.
 * - Create an update API for managed web applications.
 * - Separate APIs by function using Routers.
 * - create build function (npm install && ng build)
 * - Integrate version numbers to directory paths.
 * - Logging
 * - Create update function and API
 * - Create sessions (Redis?)
 * - Testing
 * - Change all filter()[0] to find()
 * - Research pm2.startup(platform, errback)
 */

 /**
  * Ideas:
  * Scripts to manage DBS for easy installation and maintenance of this project
  *
  * Possibly change provision to use docker containers, with the option for a database
  * and/or web application and/or API delivering data to web application from database
  * based on parameters.
  *
  * create read package.config for version number and name
  */

// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.json(),
//   transports: [
//     new winston.transports.File({
//       filename: config.log.error.path,
//       level: 'error'
//     }),
//     new winston.transports.File({
//       filename: config.log.main.path
//     })
//   ]
// });

// logger.info("");
// logger.warn("");
// logger.error("");

app.use(express.static(config.dashboard.path));

// Allow refreshing of page
app.use((req, res, next) => {
  if (req.originalUrl.includes('admin/dashboard')) {
    res.sendFile(`${config.dashboard.path}/index.html`);
  } else {
    next();
  }
});

// TODO: Is this safe?
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // allow preflight
    if (req.method === 'OPTIONS') {
      res.send(200);
    } else {
      next();
    }
});

for (let apiKey in APIs) {
  app.use('/admin/api', APIs[apiKey]);
}

app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500)
      .json({
          message: error.message,
          error: {}
      });
});

const server = app.listen(config.port, config.host, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Automation server listening at ${host}:${port}`);
});
