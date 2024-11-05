let dotInterval; // Interval for the animated dots

// Function to animate dots after "Dubbing"
function animateDots(statusElement) {
    let dotCount = 0;
    dotInterval = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        const dots = '.'.repeat(dotCount);
        statusElement.textContent = `Status: Dubbing${dots}`;
    }, 500); // Update every 500ms for smooth animation
}

// Function to update the status text and apply the corresponding CSS class
function updateStatus(status) {
    const statusElement = document.getElementById("status-text");

    if (dotInterval && status.toLowerCase() !== "dubbing") {
        clearInterval(dotInterval);
        dotInterval = null; 
    }

    if (status.toLowerCase() === "dubbing") {
        animateDots(statusElement);
    } else {
        statusElement.textContent = `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    }
    
    statusElement.classList.remove("status-default", "status-dubbed", "status-in-progress", "status-error");

    switch (status.toLowerCase()) {
      case "dubbed":
        statusElement.classList.add("status-dubbed");
        // Set the toggle to enabled when dubbing completes
        document.getElementById("dubbedAudioToggle").checked = true;
        chrome.storage.local.set({ audioToggleState: true });
        break;
      case "in progress":
        statusElement.classList.add("status-in-progress");
        break;
      case "error":
        statusElement.classList.add("status-error");
        break;
      default:
        statusElement.classList.add("status-default");
    }
}

// Load saved settings
document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(
      ["apiKey", "sourceLanguage", "targetLanguage", "numSpeakers", "dubbingStatus", "audioToggleState"],
      (data) => {
        if (data.apiKey) document.getElementById("apiKey").value = data.apiKey;
        if (data.sourceLanguage) document.getElementById("sourceLanguage").value = data.sourceLanguage;
        if (data.targetLanguage) document.getElementById("targetLanguage").value = data.targetLanguage;
        if (data.numSpeakers !== undefined) document.getElementById("numSpeakers").value = data.numSpeakers;

        const initialStatus = data.dubbingStatus ? data.dubbingStatus : "Not started";
        updateStatus(initialStatus);

        document.getElementById("dubbedAudioToggle").checked = data.audioToggleState !== false;
      }
    );
});

// Toggle switch listener
document.getElementById("dubbedAudioToggle").addEventListener("change", (event) => {
    const isDubbedOn = event.target.checked;
    chrome.storage.local.set({ audioToggleState: isDubbedOn });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { command: "toggleAudio", dubbed: isDubbedOn });
    });
});

// Event listener for "Start Dubbing" button
document.getElementById("startDubbing").addEventListener("click", () => {
    const apiKey = document.getElementById("apiKey").value.trim();
    const sourceLanguage = document.getElementById("sourceLanguage").value;
    const targetLanguage = document.getElementById("targetLanguage").value;
    const numSpeakers = parseInt(document.getElementById("numSpeakers").value) || 0;

    if (!apiKey) {
      alert("Please enter your ElevenLabs API key.");
      return;
    }

    validateApiKey(apiKey, (isValid) => {
      if (isValid) {
        chrome.storage.local.set({ apiKey, sourceLanguage, targetLanguage, numSpeakers }, () => {});

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          const url = activeTab.url;

          if (url && url.includes("youtube.com/watch")) {
            updateStatus("In Progress");

            chrome.runtime.sendMessage(
              {
                command: "startDubbing",
                videoUrl: url,
                tabId: activeTab.id,
                sourceLanguage,
                targetLanguage,
                numSpeakers,
              },
              (response) => {
                if (response && response.success) {
                } else {
                  console.error("Failed to start dubbing:", response.error);
                  updateStatus("Error");
                  alert(response.error || "An error occurred while starting dubbing.");
                }
              }
            );
          } else {
            alert("Please navigate to a YouTube video page to start dubbing.");
          }
        });
      } else {
        alert("Invalid API key. Please check and try again.");
      }
    });
});

function validateApiKey(apiKey, callback) {
    fetch("https://api.elevenlabs.io/v1/user", {
      headers: { "xi-api-key": apiKey },
    })
      .then((response) => callback(response.ok))
      .catch(() => callback(false));
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.command === "updateStatus") {
      updateStatus(message.status);
    }
});
