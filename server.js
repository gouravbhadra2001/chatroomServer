const io = require('socket.io')(3000);

const users = {};
const counters = { user1: 0, user2: 0 };
let userCount = 0;

io.on('connection', socket => {
  if (userCount < 2) {
    const user = userCount === 0 ? 'user1' : 'user2';
    userCount++;

    socket.on('new-user', name => {
      users[socket.id] = { role: user, name: name };
      io.emit('update-users', Object.values(users));
      socket.emit('assigned-variable', user);
      socket.broadcast.emit('user-connected', name);
    });

    socket.on('increment-variable', variable => {
      if (counters.hasOwnProperty(variable)) {
        counters[variable]++;
        io.emit('update-counters', counters);
      }
    });

    socket.on('disconnect', () => {
      delete users[socket.id];
      io.emit('update-users', Object.values(users));
      socket.broadcast.emit('user-disconnected', users[socket.id]?.name);
      userCount--;
    });
  } else {
    socket.emit('max-users', 'Maximum 2 users allowed');
    socket.disconnect();
  }
});
