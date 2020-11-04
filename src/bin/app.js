require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bp = require('body-parser');
const log = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(cors());
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(log('dev'));

mongoose.connect(
  process.env.mode === 'dev' ? 'mongodb://localhost:27017/minigames' : process.env.MONGO_URL,
  {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.error(err);
      console.log('Failed to connect database');
    } else {
      console.log('Connected to database');
    }
  }
);

app.use('/api', require('../routes/api'));

app.use(express.static(path.join(__dirname, '../public')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

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

require('../helpers/socket')(io);

const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`Minigames start on port ${port}!`));
