// content.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
    if (message.command === "showAlert") {
        alert(message.message);
    } else if (message.command === "playDubbedAudio") {
        const videoElement = document.querySelector("video");
        if (!videoElement) {
            console.warn("No video element found on the page.");
            alert("No video element found.");
            return;
        }

        // Check if there is an existing audio element and remove it properly
        let dubbedAudio = document.getElementById("dubbedAudio");
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

                videoElement.addEventListener("play", () => {
                    dubbedAudio.play().catch((error) => {
                        console.error("Error playing dubbed audio on video play:", error);
                    });
                });

                videoElement.addEventListener("pause", () => {
                    dubbedAudio.pause();
                });

                videoElement.addEventListener("timeupdate", syncAudio);
                videoElement.addEventListener("ratechange", () => {
                    dubbedAudio.playbackRate = videoElement.playbackRate;
                });

                // Set the video volume to 0 initially and ensure it remains muted
                videoElement.volume = 0;
                const muteInterval = setInterval(() => {
                    if (videoElement.volume !== 0) {
                        videoElement.volume = 0;
                    }
                }, 100);

                // Clear the interval if the user leaves the page
                window.addEventListener("beforeunload", () => {
                    clearInterval(muteInterval);
                });
            })
            .catch((error) => {
                console.error("Error fetching dubbed audio in content script:", error);
                alert("An error occurred while fetching the dubbed audio.");
            });
    }
});