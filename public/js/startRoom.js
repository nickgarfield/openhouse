const titleInput = document.getElementById("title-input");
titleInput.focus();

function startRoom(e) {
  e.preventDefault();
  fetch(window.location.protocol + "rooms", {
    method: "POST",
    cache: "no-cache",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: titleInput.value
    })
  })
    .then(res => res.json())
    .then(room => (window.location.href = "/r/" + room.id))
    .catch(e => console.log(e));
}
