const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:id", (req, res) => {
  res.render("room", {
    roomId: req.params.id,
    peerjs: {
      host: process.env.PEERJS_HOST,
      port: process.env.PEERJS_PORT
    }
  });
});

io.on("connection", socket => {
  socket.on("join-room", (roomId, peerId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("peer-joined-room", peerId);
    socket.on("disconnect", () =>
      socket.to(roomId).broadcast.emit("peer-exited-room", peerId)
    );
  });
});

server.listen(process.env.PORT || 3000);
