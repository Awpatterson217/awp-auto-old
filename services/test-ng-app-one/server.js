'use strict'

const express = require('express');
const path = require('path');

const app = express();

const appPath = path.join(__dirname, '0.0.1', 'www');

// For static resources
app.use(express.static(appPath));

// So that paths are handled by Angular routing
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

app.listen(3000, '127.0.0.2', () => {
    console.log('Server listening at 127.0.0.2:3000')
});