const helper = require('./helpers');

module.exports = (io) => {
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
    socket.on('login', (userId) => {
      const online = helper.setOnline(userId);
      if (online) {
        io.emit('');
      } else {
        io.emit('login', userId);
      }
    });
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};
