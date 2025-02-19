const videoElem = document.getElementById("video");
const logElem = document.getElementById("log");
const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");
let sender = false;

// webrtc peer
const peerConnection = new RTCPeerConnection({
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, // Use a public STUN server
    ],
});

// socket
const socket = new WebSocket("ws://localhost:8998");
socket.onmessage = async (event) => {
    let message;

    // Check if the event is of type Blob (for binary data) and handle it
    if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = async () => {
            message = JSON.parse(reader.result); // Convert Blob to string
            await handleMessage(message); // Call your message handler
        };
        reader.readAsText(event.data); // Read the Blob as text
    } else {
        // Handle the message normally if it's not a Blob
        message = JSON.parse(event.data);
        await handleMessage(message);
    }
};
async function handleMessage(message) {
    console.log("message type: " + message.type);
    if (sender) {
        if (message.type === "answer") {
            await peerConnection.setRemoteDescription(
                new RTCSessionDescription(message.answer),
            );
        } else if (message.type === "candidate") {
            const candidate = new RTCIceCandidate(message.candidate);
            await peerConnection.addIceCandidate(candidate);
        }
        return;
    }
    if (message.type === "offer") {
        peerConnection
            .setRemoteDescription(new RTCSessionDescription(message.offer))
            .then(() => peerConnection.createAnswer())
            .then((answer) => peerConnection.setLocalDescription(answer))
            .then(() => {
                socket.send(
                    JSON.stringify({
                        type: "answer",
                        answer: peerConnection.localDescription,
                    }),
                );
            });
    } else if (message.type === "candidate") {
        const candidate = new RTCIceCandidate(message.candidate);
        peerConnection.addIceCandidate(candidate);
    }
}

peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        socket.send(
            JSON.stringify({ type: "candidate", candidate: event.candidate }),
        );
    }
};
peerConnection.ontrack = (event) => {
    console.log("onTrack called!");
    videoElem.srcObject = event.streams[0];
};

// Options for getDisplayMedia()

const displayMediaOptions = {
    video: {
        displaySurface: "screen",
    },
    audio: false,
};

// Set event listeners for the start and stop buttons
startElem.addEventListener(
    "click",
    (evt) => {
        startCapture();
    },
    false,
);

stopElem.addEventListener(
    "click",
    (evt) => {
        stopCapture();
    },
    false,
);
async function startCapture() {
    sender = true;
    logElem.textContent = "";

    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
        });

        // Display the stream in a video element
        videoElem.srcObject = stream;

        // Add the stream to the peer connection
        stream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, stream);
        });

        // Create and send the offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // Send the offer to the other peer
        socket.send(
            JSON.stringify({
                type: "offer",
                offer: peerConnection.localDescription,
            }),
        );
    } catch (error) {
        console.error("Error sharing screen:", error);
    }
}
function dumpOptionsInfo() {
    const videoTrack = videoElem.srcObject.getVideoTracks()[0];

    console.log("Track settings:");
    console.log(JSON.stringify(videoTrack.getSettings(), null, 2));
    console.log("Track constraints:");
    console.log(JSON.stringify(videoTrack.getConstraints(), null, 2));
}

function stopCapture(evt) {
    let tracks = videoElem.srcObject.getTracks();

    tracks.forEach((track) => track.stop());
    videoElem.srcObject = null;
}
//console.log = (msg) => (logElem.textContent = `${logElem.textContent}\n${msg}`);
//console.error = (msg) =>
//    (logElem.textContent = `${logElem.textContent}\nError: ${msg}`);
