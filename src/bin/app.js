require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

require('../configs/configureApp')(app);
require('../db/db')(mongoose);
require('../helpers/socket')(io);

const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`Minigames start on port ${port}!`));
