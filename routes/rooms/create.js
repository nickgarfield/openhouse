const rooms = require("../../state/rooms");

module.exports = function(req, res, next) {
  // Parse request
  const peerId = req.user.id;

  // Fetch relevant parties
  var currentRoomId = rooms.getRoomForPeer(peerId);

  // Exit the current room
  if (currentRoomId) {
    var currentRoom = rooms.get(currentRoomId);
    if (currentRoom) {
      delete currentRoom.peers[peerId];
      if (Object.keys(currentRoom.peers).length === 0)
        rooms.destroy(currentRoomId);
      else rooms.update(currentRoom);
    }
    rooms.setRoomForPeer(peerId, null);
  }

  // Create new room
  var room = rooms.create();

  // Join new room
  room.peers[peerId] = true;
  rooms.update(room);
  rooms.setRoomForPeer(peerId, room.id);
  res.send(room);
};
