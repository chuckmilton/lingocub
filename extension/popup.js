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

    // Stop the dot animation if status is not "Dubbing"
    if (dotInterval && status.toLowerCase() !== "dubbing") {
        clearInterval(dotInterval);
        dotInterval = null; // Ensure dotInterval is reset
    }

    // Start the dot animation if status is "Dubbing"
    if (status.toLowerCase() === "dubbing") {
        animateDots(statusElement);
    } else {
        // Set the status text and capitalize the first letter
        statusElement.textContent = `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    }
    
    // Remove existing status classes
    statusElement.classList.remove("status-default", "status-dubbed", "status-in-progress", "status-error");
    
    // Add the appropriate class based on the status
    switch (status.toLowerCase()) {
      case "dubbed":
        statusElement.classList.add("status-dubbed");
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
  
  // Load saved API key, target language, and status when popup opens
  document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(
      ["apiKey", "sourceLanguage", "targetLanguage", "numSpeakers", "dubbingStatus"],
      (data) => {
        if (data.apiKey) document.getElementById("apiKey").value = data.apiKey;
        if (data.sourceLanguage) document.getElementById("sourceLanguage").value = data.sourceLanguage;
        if (data.targetLanguage) document.getElementById("targetLanguage").value = data.targetLanguage;
        if (data.numSpeakers !== undefined) document.getElementById("numSpeakers").value = data.numSpeakers;
        
        // Show saved status if available
        const initialStatus = data.dubbingStatus ? data.dubbingStatus : "Not started";
        updateStatus(initialStatus);
      }
    );
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
  
    // Validate API key and then save settings before starting dubbing
    validateApiKey(apiKey, (isValid) => {
      if (isValid) {
        chrome.storage.local.set({ apiKey, sourceLanguage, targetLanguage, numSpeakers }, () => {
        });
  
        // Get the current active YouTube tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          const url = activeTab.url;
  
          if (isSupportedPlatform(url)) {
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
  
  // Function to validate the API key
  function validateApiKey(apiKey, callback) {
    fetch("https://api.elevenlabs.io/v1/user", {
      headers: { "xi-api-key": apiKey },
    })
      .then((response) => callback(response.ok))
      .catch(() => callback(false));
  }
  
  function isSupportedPlatform(url) {
    return (
        url.includes("youtube.com/watch") ||
        url.includes("canvas") ||
        url.includes("zoom")
    );
}
  
  // Listen for status updates from the background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.command === "updateStatus") {
      updateStatus(message.status);
    }
  });
  