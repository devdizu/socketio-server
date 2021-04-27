const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;
const connectedUsers = [];
const consoleColors = {
  blue: "\x1b[36m%s\x1b[0m",
  yellow: "\x1b[33m%s\x1b[0m",
  white: "\x1b[47m\x1b[0m",
  cyan: "\x1b[36m%s\x1b[0m",
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

server.listen(port, () => {
  console.log(`listening on ${port}`);
});

function log(color, ...data) {
  console.log(consoleColors[color], ...data);
}

function showConnectedUsers() {
  log("cyan", "Connected users", connectedUsers);
}

function connectUser(socket) {
  const name = socket.request._query["name"] ?? "A user";
  const sessionID = socket.id;
  connectedUsers.push({ name, sessionID });
  const userConnectedMessage = `${name} has been connected`;
  io.emit("user connected", userConnectedMessage);
  return { name, sessionID };
}

function disconnectUser(sessionID) {
  const userIndex = connectedUsers.findIndex(
    (user) => user.sessionID === sessionID
  );
  log("yellow", `${connectedUsers[userIndex].name} has been disconnected`);
  connectedUsers.splice(userIndex, 1);
}

io.on("connection", (socket) => {
  const { sessionID } = connectUser(socket);
  showConnectedUsers();

  socket.on("chat message", (messageData) => {
    log("white", "message: " + JSON.stringify(messageData));
    io.emit("chat message", messageData);
  });

  socket.on("disconnect", () => {
    disconnectUser(sessionID);
    showConnectedUsers();
  });
});
