// popup.js

// Load saved API key, target language, and status when popup opens
document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["apiKey", "sourceLanguage", "targetLanguage", "numSpeakers", "dubbingStatus"], (data) => {
      if (data.apiKey) document.getElementById("apiKey").value = data.apiKey;
      if (data.sourceLanguage) document.getElementById("sourceLanguage").value = data.sourceLanguage;
      if (data.targetLanguage) document.getElementById("targetLanguage").value = data.targetLanguage;
      if (data.numSpeakers !== undefined) document.getElementById("numSpeakers").value = data.numSpeakers;
  
      // Show saved status if available
      const statusElement = document.getElementById("status-text");
      statusElement.textContent = data.dubbingStatus ? `Status: ${data.dubbingStatus}` : "Status: Not started";
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
  
    // Validate API key and then save settings before starting dubbing
    validateApiKey(apiKey, (isValid) => {
      if (isValid) {
        chrome.storage.local.set({ apiKey, sourceLanguage, targetLanguage, numSpeakers }, () => {
          console.log("Settings saved successfully.");
        });
  
        // Get the current active YouTube tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          const url = activeTab.url;
  
          if (url && url.includes("youtube.com/watch")) {
            document.getElementById("status-text").textContent = "Status:";
  
            // Start dubbing and update status
            chrome.runtime.sendMessage(
                { command: "startDubbing", videoUrl: url, tabId: activeTab.id, sourceLanguage, targetLanguage, numSpeakers },
              (response) => {
                if (response && response.success) {
                  console.log("Dubbing started successfully.");
                } else {
                  console.error("Failed to start dubbing:", response.error);
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
      headers: { "xi-api-key": apiKey }
    })
      .then((response) => callback(response.ok))
      .catch(() => callback(false));
  }
  
  // Listen for status updates from the background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.command === "updateStatus") {
      document.getElementById("status-text").textContent = `Status: ${message.status}`;
    }
  });
  