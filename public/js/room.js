const socket = io("/");
var remotePeers = {};
var localStream = null;
const localPeer = new Peer({
  host: PEERJS_HOST,
  port: PEERJS_PORT
});

const peerGrid = document.getElementById("peer-grid");
const muteButton = document.getElementById("mute-button");

localPeer.on("open", localPeerId => {
  const opt = { video: false, audio: true };
  navigator.mediaDevices.getUserMedia(opt).then(s => {
    localStream = s;
    localStream.getAudioTracks()[0].onmute = evt => {
      localStream.getAudioTracks()[0].enabled = false;
      onToggleIsMuted();
    };
    localStream.getAudioTracks()[0].onunmute = evt => {
      localStream.getAudioTracks()[0].enabled = true;
      onToggleIsMuted();
    };
    localPeer.on("call", call => {
      call.answer(localStream);
      call.on("stream", remoteStream => addPeerProfile(call, remoteStream));
    });
    socket.on("peer-joined-room", peerId => onPeerJoined(peerId, localStream));
    socket.on("peer-left-room", peerId => onPeerLeft(peerId));
    socket.emit("join-room", ROOM_ID, localPeerId);
    addLocalProfile();
  });
});

function onPeerJoined(remotePeerId, localStream) {
  const call = localPeer.call(remotePeerId, localStream);
  call.on("stream", remoteStream => addPeerProfile(call, remoteStream));
}

function onPeerLeft(remotePeerId) {
  if (remotePeers[remotePeerId]) remotePeers[remotePeerId].close();
}

function leaveRoom(e) {
  e.preventDefault();
  socket.disconnect();
  window.location.href = "/";
}

function toggleIsMuted(e) {
  e.preventDefault();
  const track = localStream.getAudioTracks()[0];
  if (!track.muted) track.enabled = !track.enabled;
  // TODO else display warning (cannot record audio in this case)
  onToggleIsMuted();
}

function onToggleIsMuted() {
  muteButton.innerHTML =
    localStream.getAudioTracks()[0].enabled &&
    !localStream.getAudioTracks()[0].muted
      ? "Mute"
      : "Unmute";
}

function addLocalProfile() {
  var peerName = document.createElement("span");
  peerName.className = "peer-name";
  peerName.appendChild(document.createTextNode("You"));

  var peerElem = document.createElement("div");
  peerElem.className = "peer";
  peerElem.appendChild(peerName);

  var container = document.createElement("div");
  container.className = "peer-container";
  container.appendChild(peerElem);

  peerGrid.appendChild(container);
}

function addPeerProfile(call, stream) {
  var peerName = document.createElement("span");
  peerName.className = "peer-name";
  peerName.appendChild(document.createTextNode(call.peer.substring(0, 4)));

  var audioElem = document.createElement("audio");
  audioElem.srcObject = stream;
  audioElem.addEventListener("loadedmetadata", () => audioElem.play());

  var peerElem = document.createElement("div");
  peerElem.className = "peer";
  peerElem.appendChild(peerName);
  peerElem.appendChild(audioElem);

  var container = document.createElement("div");
  container.className = "peer-container";
  container.appendChild(peerElem);

  remotePeers[call.peer] = call;
  call.on("close", () => container.remove());
  peerGrid.appendChild(container);
}
