function startRoom() {
  window.location.href = "/start";
}

function joinRoom(e) {
  window.location.href = "/r/" + e.target.name;
}
