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
const helper = require('../helpers/socket');

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

app.use(express.static(path.join(__dirname, '../public')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

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

io.use((socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    const auth = helper.cekAuth(socket.handshake.query.token);
    if (!auth) {
      return next(new Error('Authentication error'));
    }
    next();
  } else {
    next(new Error('Authentication error'));
  }
}).on('connection', (socket) => {
  console.log('user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`Minigames start on port ${port}!`));
