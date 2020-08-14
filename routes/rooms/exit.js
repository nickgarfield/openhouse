const rooms = require("../../state/rooms");

module.exports = function(req, res, next) {
  console.log("POST /rooms/current/exit");

  // Parse request
  const peerId = req.body.peerId; // TODO: Get this from a JWT

  // Fetch relevant parties
  var currentRoomId = rooms.getRoomForPeer(peerId);
  if (!currentRoomId) res.send("You're not in a room");
  var currentRoom = rooms.get(currentRoomId);
  if (!currentRoom) res.send("You're not in that room");

  // Exit the current room
  delete currentRoom.peers[peerId];
  if (Object.keys(currentRoom.peers).length === 0) rooms.destroy(currentRoomId);
  else rooms.update(currentRoom);
  rooms.setRoomForPeer(peerId, null);
  res.send(currentRoom);
};
