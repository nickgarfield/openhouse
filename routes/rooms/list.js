const rooms = require("../../state/rooms");

module.exports = function(req, res, next) {
  console.log("GET /rooms");
  res.send(rooms.list());
};
