// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "startDubbing") {
      chrome.storage.local.get(["apiKey", "targetLanguage"], (data) => {
        const { apiKey } = data;
        const { videoUrl, sourceLanguage, targetLanguage, numSpeakers, tabId } = message;
  
        if (!apiKey) {
          chrome.tabs.sendMessage(message.tabId, {
            command: "showAlert",
            message: "Please enter your ElevenLabs API key in the extension popup.",
          });
          sendResponse({ success: false, error: "API key not provided." });
          return;
        }
  
        startDubbing(videoUrl, apiKey, sourceLanguage, targetLanguage, numSpeakers, tabId);
        sendResponse({ success: true });
      });
  
      return true;
    }
  });
  
  
  function startDubbing(sourceUrl, apiKey, sourceLanguage, targetLanguage, numSpeakers, tabId) {
    const formData = new FormData();
    formData.append("source_url", sourceUrl);
    formData.append("target_lang", targetLanguage);
    formData.append("source_lang", sourceLanguage);
    formData.append("num_speakers", numSpeakers);
    formData.append("watermark", "false");
  
    fetch("https://api.elevenlabs.io/v1/dubbing", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey
      },
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.dubbing_id) {
          chrome.storage.local.set({ dubbingStatus: "dubbing" });
          checkDubbingStatus(data.dubbing_id, apiKey, targetLanguage, tabId);
        } else {
          console.error("Dubbing request failed:", data);
          chrome.tabs.sendMessage(tabId, {
            command: "showAlert",
            message: `Dubbing request failed: ${data.error || "Please check your API key and try again."}`
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        chrome.tabs.sendMessage(tabId, {
          command: "showAlert",
          message: "An error occurred while making the dubbing request."
        });
      });
  }
  
  function checkDubbingStatus(dubbingId, apiKey, targetLanguage, tabId) {
    const interval = setInterval(() => {
      fetch(`https://api.elevenlabs.io/v1/dubbing/${dubbingId}`, {
        headers: { "xi-api-key": apiKey }
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "dubbed") {
            clearInterval(interval);
            chrome.storage.local.set({ dubbingStatus: "dubbed" });
            fetchDubbedAudio(dubbingId, targetLanguage, apiKey, tabId);
            chrome.runtime.sendMessage({ command: "updateStatus", status: "Dubbed" });
          } else if (data.status === "failed") {
            clearInterval(interval);
            chrome.storage.local.set({ dubbingStatus: "failed" });
            chrome.tabs.sendMessage(tabId, {
              command: "showAlert",
              message: `Dubbing failed: ${data.error || "Please try again."}`
            });
            chrome.runtime.sendMessage({ command: "updateStatus", status: "failed" });
          } else {
            chrome.runtime.sendMessage({ command: "updateStatus", status: "dubbing" });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          clearInterval(interval);
          chrome.tabs.sendMessage(tabId, {
            command: "showAlert",
            message: "An error occurred while checking dubbing status."
          });
        });
    }, 1000); // Check every 5 seconds
  }  
  
  function fetchDubbedAudio(dubbingId, languageCode, apiKey, tabId) {
    const proxyUrl = `http://localhost:3000/dubbed-audio?dubbingId=${dubbingId}&languageCode=${languageCode}&apiKey=${apiKey}`;
    chrome.tabs.sendMessage(tabId, { command: "playDubbedAudio", audioUrl: proxyUrl });
  }
