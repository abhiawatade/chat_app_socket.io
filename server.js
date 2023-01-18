const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.use(express.static("public"));

const usernames = {};
const rooms = [
  { name: "globalChat", creator: "anonymous" },
  { name: "anime", creator: "anonymous" },
  { name: "javascript", creator: "anonymous" },
];

io.on("connection", function (socket) {
  socket.on("createUser", function (username) {
    socket.username = username;
    usernames[username] = username;
    socket.currentRoom = "globalChat";
    socket.join("globalChat");
    socket.emit("updateChat", "INFO", "You have joined the global chat");

    socket.on("sendMessage", function (data) {
      io.sockets
        .to(socket.currentRoom)
        .emit("updateChat", socket.username, data);
    });

    ///create room
    socket.on("createRoom", function (room) {
      if (room != null) {
        rooms.push({ name: room, creator: socket.username });
        io.sockets.emit("updateRooms", rooms, null);
      }
    });

    socket.on("updateRooms", function (room) {
      socket.broadcast
        .to(socket.currentRoom)
        .emit("updateChat", "INFO", socket.username + "left the room");
      socket.leave(socket.currentRoom);
      socket.currentRoom = room;
      socket.join(room);
      socket.emit("updateChat", "INFO", "you have joined " + room);
    });
  });
});

server.listen(4000, function () {
  console.log("server listening");
});
