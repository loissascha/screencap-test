import { useEffect, useState } from "react";
import "./App.css";

function App() {
    const [logs, setLogs] = useState<string>("");
    useEffect(() => {
        // Check if RTCPeerConnection is available
        if (typeof RTCPeerConnection !== "undefined") {
            // webrtc peer
            const peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" }, // Use a public STUN server
                ],
            });
        } else {
            console.error("RTCPeerConnection is not available.");
            setLogs("WEBRTC not available!");
        }

        // socket
        const socket = new WebSocket("ws://sl-dev.at:8998");
    }, []);

    return (
        <div id="App">
            <p>
                This example shows you the contents of the selected part of your
                display. Click the Start Capture button to begin.
            </p>

            <p>
                <button id="start">Start Capture</button>&nbsp;
                <button id="stop">Stop Capture</button>
            </p>

            <video id="video" autoPlay></video>
            <br />

            <strong>Log:</strong>
            {logs}
        </div>
    );
}

export default App;
