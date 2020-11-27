const express = require("express");
const socketio = require("socket.io");

const http = require("http");

const PORT = process.env.PORT || 5000;

const router = require("./router");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./user");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, cb) => {
    const { error, user } = addUser(socket.id, name, room);
    if (error)
      return cb( error );

    socket.emit("message", { user: "admin", text: `${user.name} welcome to this room` });
    socket.broadcast.to(user.room).emit("message", { user: "admin", text: `${user.name} has joined` });
    socket.join(user.room);

    cb();
  });

  socket.on('sendMessage', (message, cb) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', {user: user.name, text: message});

    cb();
  })

  socket.on("disconnect", () => {
    console.log("User had left!!!");
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));