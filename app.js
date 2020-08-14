// Initialize app
var app = require("express")();
app.use(require("body-parser").json());

// CORS
app.use(
  require("cors")({
    credentials: true,
    origin: ["https://openhouse-client.herokuapp.com", "http://localhost:3000"]
  })
);

// Auth
var feather = require("feather-server-node")(process.env.FEATHER_API_KEY);
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(403).json({ error: "Invalid authorization header" });
  const idToken = authHeader.substring(7, authHeader.length);
  feather
    .verifyIdToken(idToken)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(e => {
      console.log(e);
      res.status(403).json({ error: "Invalid authorization header" });
    });
});

// Routes
app.post("/rooms", require("./routes/rooms/create"));
app.post("/rooms/:id/enter", require("./routes/rooms/enter"));
app.post("/rooms/current/exit", require("./routes/rooms/exit"));
app.get("/rooms", require("./routes/rooms/list"));

// Create server
var server = require("http").createServer(app);

// Extend server with PeerJS
var peerServer = require("peer").ExpressPeerServer(server, { debug: true });
app.use("/peerjs", peerServer);

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

// Run the server
const PORT = process.env.PORT || 9000;
server.listen(PORT);
