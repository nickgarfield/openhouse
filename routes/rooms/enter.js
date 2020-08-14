const rooms = require("../../state/rooms");

module.exports = function(req, res, next) {
  // Parse request
  const peerId = req.user.id;
  const roomId = req.params.id;

  console.log(`POST /rooms/${roomId}/enter`);

  // Fetch relevant parties
  var currentRoomId = rooms.getRoomForPeer(peerId);
  var room = rooms.get(roomId);

  // Safety checks
  if (!room) res.send("That room doesn't exist");
  if (roomId === currentRoomId) res.send(room);

  // Exit the current room
  if (currentRoomId) {
    var currentRoom = rooms.get(currentRoomId);
    delete currentRoom.peers[peerId];
    if (Object.keys(currentRoom.peers).length === 0)
      rooms.destroy(currentRoomId);
    else rooms.update(currentRoom);
    rooms.setRoomForPeer(peerId, null);
  }

  // Enter new room
  room.peers[peerId] = true;
  rooms.update(room);
  rooms.setRoomForPeer(peerId, roomId);
  res.send(room);
};
