'use strict';

/**
 * @author Adam Patterson <awpatterson217@gmail.com>
 */

const express = require('express');

const {
  processManager
} = require('../../');

const router = express.Router();

const config = require('../../../config');

router.post('/provision', ({
  body: {
    host,
    port,
    repository,
    activeURL,
    instances,
    maxMemoryUsage
  }
}, res) => {
  console.log(Date().toLocaleString() + " - Provision post");

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
    repository,
    tempPath,
    instances,
    servicesPath,
    activeURL,
    maxMemoryUsage
   };

   processManager.provision(options)
    .then((result) => {
      console.log('finished provisioning: ', result);
    })
    .catch((error) => {
      console.error(Date().toLocaleString(), error);
    });

    res.status(200).json({ info: 'provisioning'});
});

module.exports = router;
