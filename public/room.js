const socket = io("/");
const peerGrid = document.getElementById("peer-grid");
const peers = {};
const myPeer = new Peer({
  host: process.env.PEERJS_HOST,
  port: process.env.PEERJS_PORT
});

myPeer.on("open", myPeerId => {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then(myStream => {
      myPeer.on("call", call => {
        call.answer(myStream);
        call.on("stream", peerStream => addPeer(call, peerStream));
      });
      socket.on("peer-joined-room", peerId => call(peerId, myStream));
      socket.on("peer-exited-room", peerId => hangUp(peerId));
      socket.emit("join-room", ROOM_ID, myPeerId);
    });
});

function call(peerId, myStream) {
  const call = myPeer.call(peerId, myStream);
  call.on("stream", peerStream => addPeer(call, peerStream));
}

function hangUp(peerId) {
  if (peers[peerId]) peers[peerId].close();
}

function addPeer(call, stream) {
  peers[call.peer] = call;
  var peerElem = document.createElement("div");
  var audioElem = document.createElement("audio");
  audioElem.srcObject = stream;
  audioElem.addEventListener("loadedmetadata", () => audioElem.play());
  peerElem.className = "peer";
  peerElem.appendChild(document.createTextNode("Peer " + call.peer));
  peerElem.appendChild(audioElem);
  peerGrid.appendChild(peerElem);
  call.on("close", () => peerElem.remove());
}
