'use strict'

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
 * - create build function (npm install && ng build)
 * - create read package.config for version number and name
 * - Integrate version numbers
 */
// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.json(),
//   transports: [
//     new winston.transports.File({
//       filename: config.log.error,
//       level: 'error'
//     }),
//     new winston.transports.File({
//       filename: config.log.main
//     })
//   ]
// });
// logger.info("info 127.0.0.1 - there's no place like home");
// logger.warn("warn 127.0.0.1 - there's no place like home");
// logger.error("error 127.0.0.1 - there's no place like home");

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

app.get('/server', (req, res) => {
  listAll()
    .then((processes) => {
      res.set('Access-Control-Allow-Origin', '*').status(200).json(processes);
    })
    .catch((error) => {
      console.error(error);

      res.status(500).json(error);
    });
});

app.get('/server/:id', (req, res) => {
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

app.put('/provision', (req, res) => {
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
    const error = new Error('/provision (PUT) - No matching actions');
    console.error(error);

    res.status(500).json(error);
  }
});

app.delete('/provision/:id', (req, res) => {
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

  console.log(`Generate server listening at ${host}:${port}`);
});
