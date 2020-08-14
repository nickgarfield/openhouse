// initialize express
var express = require("express");
var app = express();

// Middleware
app.use(require("body-parser").json());

// Setup CORS
var cors = require("cors");
app.use(
  cors({
    credentials: true,
    origin: ["https://2b252650c549.ngrok.io", "http://localhost:3000"]
  })
);

// Routes
app.post("/rooms", require("./routes/rooms/create"));
app.post("/rooms/:id/enter", require("./routes/rooms/enter"));
app.post("/rooms/current/exit", require("./routes/rooms/exit"));
app.get("/rooms", require("./routes/rooms/list"));

// create express peer server
var ExpressPeerServer = require("peer").ExpressPeerServer;

// create a http server instance to listen to request
var server = require("http").createServer(app);

// peerjs is the path that the peerjs server will be connected to.
var options = { debug: true };
var peerServer = ExpressPeerServer(server, options);
app.use("/peerjs", peerServer);

// Subscribe to websockets
peerServer.on("connection", function(socket) {
  console.log("Peer connected to server");
});

peerServer.on("disconnect", function(socket) {
  // Peer disconnected from server.
  // Leave the current room
  const peerId = socket.id;
  const rooms = require("./state/rooms");
  const currentRoomId = rooms.getRoomForPeer(peerId);
  if (!currentRoomId) return;
  var currentRoom = rooms.get(currentRoomId);
  if (!currentRoom) return;
  delete currentRoom.peers[peerId];
  if (Object.keys(currentRoom.peers).length === 0) rooms.destroy(currentRoomId);
  else rooms.update(currentRoomId);
});

// Now listen to your ip and port.
server.listen(9000);
