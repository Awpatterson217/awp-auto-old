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
 * - Separate UI server list to active and inactive.
 * - Create mechanism for keeping track of inactive servers.
 * - Authentication API and UI.
 * Keep dashboard and login UIs separate?
 * Use a uniquely generated path that only exists for the duration of the session,
 * while also verifying the session to access the URL? Would be more secure, could allow
 * the dashboard to still manually refresh pages, could mitigate the risk of somehow
 * bypassing the login UI and accessing the dashboard directly?
 * - Add provision to dashboard.
 * - Add dedicated database to manage login information.
 * Scripts to manage DBS for easy installation and maintenance of this project?
 * Automate total installation for this project?
 * - Remove dashboard for users? Or create Users API? Purpose?
 * If managing users for web applications, should this go some place else,
 * like perhaps a unique page for each server.
 * - Add GIT repo, version number, and option to update the
 * web application for each listed server in dashboard.
 * - Create an update API for managed web applications.
 * - Separate APIs by function using Routers.
 * - Find a way to handle browser refresh for dashboard routes.
 * otherwise when refreshing browser page server returns nothing.
 * - create build function (npm install && ng build)
 * - create read package.config for version number and name
 * - Integrate version numbers
 * - Add logging API for this server and services
 * (Is the below safe? otherwise script? Verify identity with key?)
 * - Create update function and API
 * - Create sessions (Redis?)
 * - Only one user at a time?
 * - Create tests
 * - Change all filter()[0] to find()
 */

 /**
  * Ideas:
  *
  * Option to have API servers as well? Using databases hosted in docker
  * containers? Include certain parameters for database, include local versus other?
  *
  * Possibly change provision to use docker containers, with the option for a database
  * and/or web application and/or API delivering data to web application from database
  * based on parameters.
  *
  * Keep PM2 but add the option to use Docker container later on?
  * Can I use docker with PM2 natively? Otherwise how to interface with each docker container.
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

app.get('/server/active', (req, res) => {
  listAll()
    .then((processes) => {
      res.set('Access-Control-Allow-Origin', '*').status(200).json(processes);
    })
    .catch((error) => {
      console.error(error);

      res.status(500).json(error);
    });
});

app.get('/server/active/:id', (req, res) => {
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

app.put('/server/active', (req, res) => {
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

app.delete('/server/:id', (req, res) => {
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

// TODO
app.get('/server/inactive', (req, res) => {
  listAll()
    .then((processes) => {
      res.set('Access-Control-Allow-Origin', '*').status(200).json(processes);
    })
    .catch((error) => {
      console.error(error);

      res.status(500).json(error);
    });
});

// TODO
app.get('/server/inactive/:id', (req, res) => {
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

app.post('/provision', ({ body: { host, port, url, name }}, res) => {
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
