function startRoom() {
  fetch(window.location.protocol + "rooms", {
    method: "POST",
    cache: "no-cache",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: null
    })
  })
    .then(res => res.json())
    .then(room => (window.location.href = "/r/" + room.id))
    .catch(e => console.log(e));
}

function joinRoom(e) {
  e.preventDefault();
  window.location.href = "/r/" + e.target.name;
}
