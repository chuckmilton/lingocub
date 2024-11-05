// content.js

let isDubbedOn = true; // Default to dubbed audio on
let dubbedAudio; // Declare dubbedAudio globally to manage its state

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const videoElement = document.querySelector("video");

    if (message.command === "showAlert") {
        alert(message.message);
    } else if (message.command === "playDubbedAudio") {
        if (!videoElement) {
            console.warn("No video element found on the page.");
            alert("No video element found.");
            return;
        }

        // Check if there is an existing audio element and remove it properly
        if (dubbedAudio) {
            dubbedAudio.pause();
            dubbedAudio.src = ""; // Clear the audio source to stop any ongoing playback
            dubbedAudio.load(); // Reset the audio element
            dubbedAudio.remove(); // Remove from DOM
        }

        // Create a new audio element for the dubbed audio
        dubbedAudio = document.createElement("audio");
        dubbedAudio.id = "dubbedAudio";
        dubbedAudio.crossOrigin = "anonymous";
        dubbedAudio.style.display = "none";
        document.body.appendChild(dubbedAudio);

        // Fetch the audio file from the proxy URL
        fetch(message.audioUrl)
            .then((response) => response.blob())
            .then((blob) => {
                dubbedAudio.src = URL.createObjectURL(blob);

                // Sync the dubbed audio with the video playback
                const syncAudio = () => {
                    const offset = videoElement.currentTime - dubbedAudio.currentTime;
                    if (Math.abs(offset) > 0.3) {
                        dubbedAudio.currentTime = videoElement.currentTime;
                    }
                };

                // Attach event listeners to control dubbed audio based on video state
                videoElement.addEventListener("play", () => {
                    if (isDubbedOn) {
                        dubbedAudio.play().catch((error) => {
                            console.error("Error playing dubbed audio on video play:", error);
                        });
                    }
                });

                videoElement.addEventListener("pause", () => {
                    dubbedAudio.pause();
                });

                videoElement.addEventListener("timeupdate", syncAudio);

                videoElement.addEventListener("ratechange", () => {
                    dubbedAudio.playbackRate = videoElement.playbackRate;
                });

                videoElement.addEventListener("seeked", () => {
                    if (isDubbedOn && !videoElement.paused) {
                        dubbedAudio.play();
                    } else {
                        dubbedAudio.pause();
                    }
                });

                // Initialize audio based on the saved toggle state but don't auto-play
                chrome.storage.local.get("audioToggleState", (data) => {
                    isDubbedOn = data.audioToggleState !== false;
                    toggleAudio(isDubbedOn, false); // Pass false to prevent auto-play on load
                });
            })
            .catch((error) => {
                console.error("Error fetching dubbed audio in content script:", error);
                alert("An error occurred while fetching the dubbed audio.");
            });
    } else if (message.command === "toggleAudio") {
        toggleAudio(message.dubbed);
    }
});

// Function to toggle between dubbed and original audio
function toggleAudio(isDubbed, playImmediately = true) {
    const videoElement = document.querySelector("video");

    isDubbedOn = isDubbed; // Update the global state

    if (isDubbed) {
        videoElement.volume = 0;
        if (dubbedAudio && playImmediately && !videoElement.paused) {
            dubbedAudio.play();
        }
    } else {
        if (dubbedAudio) {
            dubbedAudio.pause();
        }
        videoElement.volume = 1;
    }
}
