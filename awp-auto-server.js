'use strict';

/**
 * @author Adam Patterson <awpatterson217@gmail.com>
 */

const express = require('express');
const winston = require('winston');

const {
  provision,
  list,
  listAll,
  suspend,
  reload,
  remove,
  start
} = require('./src');

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

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: config.log.error.path,
      level: 'error'
    }),
    new winston.transports.File({
      filename: config.log.main.path
    })
  ]
});

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

app.get('/admin/api/server', (req, res) => {
  listAll()
    .then((processes) => {
      res.set('Access-Control-Allow-Origin', '*').status(200).json(processes);
    })
    .catch((error) => {
      console.error(error);

      res.status(500).json(error);
    });
});

app.get('/admin/api/server/:id', (req, res) => {
  const { id } = req.params;

  list(id)
    .then((process) => {
      res.set('Access-Control-Allow-Origin', '*').status(200).json(process);
    })
    .catch((error) => {
      console.error(error);

      res.status(500).json(error);
    });
});

app.put('/admin/api/server', (req, res) => {
  console.log(req.body);

  const {
    action,
    id
  } = req.body;

  if(action === 'suspend') {
    suspend(id)
      .then((result) => {
        if(result) {
          res.set('Access-Control-Allow-Origin', '*').status(200).json({});
        }
      })
      .catch((error) => {
        console.error(error);

        res.status(500).json(error);
      });
  } else if(action === 'reload') {
    reload(id)
      .then((result) => {
        if(result) {
          res.set('Access-Control-Allow-Origin', '*').status(200).json({});
        }
      })
      .catch((error) => {
        console.error(error);

        res.status(500).json(error);
      });
  } else if(action === 'start') {
    start(id)
      .then((result) => {
        if(result) {
          res.set('Access-Control-Allow-Origin', '*').status(200).json({});
        }
      })
      .catch((error) => {
        console.error(error);

        res.status(500).json(error);
      });
  } else {
    const error = new Error('/server/active (PUT) - No matching actions');
    console.error(error);

    res.status(500).json(error);
  }
});

app.delete('/admin/api/server/:id', (req, res) => {
  const { id } = req.params;

  remove(id)
    .then((result) => {
      if(result) {
        res.set('Access-Control-Allow-Origin', '*').status(200).json({});
      }
    })
    .catch((error) => {
      console.error(error);

      res.status(500).json(error);
    });
});

app.post('/admin/api/provision', ({ body: { host, port, url, name }}, res) => {
  const {
    temp: {
      path: tempPath
    },
    services: {
      path: servicesPath
    }
  } = config;

   const options = {
    host,
    port,
    url,
    name,
    tempPath,
    // TODO
    // instances,
    servicesPath
   };

   provision(options)
    .then((result) => {
      res.set('Access-Control-Allow-Origin', '*').status(200).json(result);
    })
    .catch((error) => {
      console.error(error);

      res.status(500).json(error);
    });
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

const server = app.listen(config.port, config.host, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Automation server listening at ${host}:${port}`);
});
