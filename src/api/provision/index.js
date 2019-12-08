'use strict';

/**
 * @author Adam Patterson <awpatterson217@gmail.com>
 */

const express = require('express');

const {
  pm2
} = require('../../');

const router = express.Router();

const config = require('../../../config');

router.post('/provision', ({ body: { host, port, url }}, res) => {
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
    url,
    tempPath,
    // instances,
    servicesPath
   };

   pm2.provision(options)
    .then((result) => {
      console.log('finished provisioning: ', result);
    })
    .catch((error) => {
      console.error(Date().toLocaleString(), error);
    });

    res.status(200).json({ info: 'provisioning'});
});

module.exports = router;
