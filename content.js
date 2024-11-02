// content.js

console.log("Content script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in content script:", message);
  
    if (message.command === "showAlert") {
      alert(message.message);
    } else if (message.command === "playDubbedAudio") {
      const videoElement = document.querySelector("video");
      if (!videoElement) {
        alert("No video element found.");
        return;
      }
  
      let dubbedAudio = document.getElementById("dubbedAudio");
      if (dubbedAudio) {
        dubbedAudio.pause();
        dubbedAudio.remove();
      }
  
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
          dubbedAudio.pause(); // Pause to prevent automatic playback
  
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
  
          // Set the video volume to 0 initially
          videoElement.volume = 0;
  
          // Use setInterval to ensure volume remains 0
          const muteInterval = setInterval(() => {
            if (videoElement.volume !== 0) {
              videoElement.volume = 0;
            }
          }, 100); // Check every 100 milliseconds
  
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

  