'use strict';

/**
 * @author Adam Patterson <awpatterson217@gmail.com>
 */

const express = require('express');

const {
  logManager
} = require('../../');

const config = require('../../../config');

const {
  services: {
    path: servicesPath
  }
} = config;

const router = express.Router();

router.get('/log', (req, res) => {
  // TODO
});

router.get('/log/:id', (req, res) => {
  const { id } = req.params;
  // TODO
});


router.delete('/log/:id', (req, res) => {
  const { id } = req.params;
  // TODO
});

module.exports = router;
