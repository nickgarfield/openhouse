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
      didToggleIsMuted();
    };
    localStream.getAudioTracks()[0].onunmute = evt => {
      localStream.getAudioTracks()[0].enabled = true;
      didToggleIsMuted();
    };
    localPeer.on("call", call => {
      call.answer(localStream);
      call.on("stream", remoteStream => addPeerProfile(call, remoteStream));
    });
    socket.on("peer-joined-room", peerId => call(peerId, localStream));
    socket.on("peer-exited-room", peerId => hangUp(peerId));
    socket.emit("join-room", ROOM_ID, localPeerId);
    addLocalProfile();
  });
});

function call(remotePeerId, localStream) {
  const call = localPeer.call(remotePeerId, localStream);
  call.on("stream", remoteStream => addPeerProfile(call, remoteStream));
}

function hangUp(remotePeerId) {
  if (remotePeers[remotePeerId]) remotePeers[remotePeerId].close();
}

function toggleIsMuted() {
  const track = localStream.getAudioTracks()[0];
  if (!track.muted) track.enabled = !track.enabled;
  // TODO else display warning (cannot record audio in this case)
  didToggleIsMuted();
}

function didToggleIsMuted() {
  muteButton.innerHTML =
    localStream.getAudioTracks()[0].enabled &&
    !localStream.getAudioTracks()[0].muted
      ? "Mute"
      : "Unmute";
}

function addLocalProfile() {
  var peerElem = document.createElement("div");
  peerElem.className = "peer";
  peerElem.appendChild(document.createTextNode("You"));
  peerGrid.appendChild(peerElem);
}

function addPeerProfile(call, stream) {
  var peerElem = document.createElement("div");
  peerElem.className = "peer";
  var audioElem = document.createElement("audio");
  audioElem.srcObject = stream;
  audioElem.addEventListener("loadedmetadata", () => audioElem.play());
  peerElem.appendChild(document.createTextNode("Peer " + call.peer));
  peerElem.appendChild(audioElem);
  remotePeers[call.peer] = call;
  call.on("close", () => peerElem.remove());
  peerGrid.appendChild(peerElem);
}
