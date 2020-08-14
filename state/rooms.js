const uuidv4 = require("uuid").v4;

// Keep track of the open rooms
var rooms = {};
var roomForPeer = {};

function create() {
  const roomId = uuidv4();
  const newRoom = {
    id: roomId,
    peers: {}
  };
  rooms[roomId] = newRoom;
  return newRoom;
}

function get(id) {
  return rooms[id];
}

function destroy(id) {
  delete rooms[id];
}

function update(room) {
  rooms[room.id] = room;
}

function list() {
  return rooms;
}

function getRoomForPeer(peerId) {
  return roomForPeer[peerId];
}

function setRoomForPeer(peerId, roomId) {
  if (!roomId) delete roomForPeer[peerId];
  else roomForPeer[peerId] = roomId;
}

module.exports = {
  create,
  get,
  destroy,
  update,
  list,
  getRoomForPeer,
  setRoomForPeer
};
