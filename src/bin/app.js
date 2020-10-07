require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bp = require('body-parser');
const log = require('morgan');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(log('dev'));

mongoose.connect(
  process.env.MONGO_URL,
  {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log('Failed to connect database');
    }
    console.log('Connected to database');
  }
);

app.get('/', (req, res) => res.redirect('/api'));
app.use('/api', require('../routes/api'));

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({
    message: req.method + ' ' + req.url + ' not found',
    error: 'NoEndpointExist',
    code: 404,
  });
  next();
});

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Minigames start on port ${port}!`));
