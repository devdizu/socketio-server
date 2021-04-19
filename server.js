const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);

const connectedUsers = [];

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

server.listen(80, () => {
  console.log("listening on *:80");
});

function showConnectedUsers() {
  console.log("Connected users", connectedUsers);
}

function disconnectUser(sessionID) {
  connectedUsers.splice(
    connectedUsers.findIndex((user) => user.sessionID === sessionID),
    1
  );
}

io.on("connection", (socket) => {
  const name = socket.request._query["name"] ?? "A user";
  const sessionID = socket.id;
  const userConnectedMessage = `${name} has been connected`;
  connectedUsers.push({ name, sessionID });
  console.log("\x1b[36m%s\x1b[0m", userConnectedMessage);
  showConnectedUsers();
  io.emit('user connected', userConnectedMessage);

  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
    io.emit('chat message', `${name}: ${msg}`);
  });

  socket.on("disconnect", () => {
    disconnectUser(sessionID);
    console.log("\x1b[33m%s\x1b[0m", `${name} has been disconnected`);
    console.log("Connected users", connectedUsers);
  });
});
