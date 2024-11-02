## LingoCub
LingoCub is a Chrome extension that enables real-time dubbing for YouTube videos in multiple languages. This extension uses the ElevenLabs API to provide dubbed audio based on user-selected source and target languages. The extension seamlessly integrates with YouTube, muting the original video audio and synchronizing dubbed audio playback with the video.

### Features
- Real-Time Dubbing: Dub YouTube videos in real time into your preferred language.
- Customizable Settings: Choose your source language, target language, and specify the number of speakers for optimal dubbing.
- Automatic Detection: Automatically detects when a new video is loaded and applies the dubbing settings without needing to reload the page.
- Audio Synchronization: Synchronizes dubbed audio with YouTube's video playback for a seamless experience.
### Installation
1. #### Clone the Repository:

```git clone https://github.com/chuckmilton/lingocub.git```

2. #### Load the Extension:

- Open Chrome and navigate to `chrome://extensions/`.
- Enable **Developer mode** in the top-right corner.
- Click on **Load unpacked** and select the cloned `lingocub` directory.

3. #### Setup API Key:

- Obtain an API key from [ElevenLabs](https://elevenlabs.io/api) for access to dubbing services.
- Enter the API key in the LingoCub extension popup.

### Usage
1. **Open YouTube** and navigate to a video.
2. Click on the **LingoCub extension icon** to open the settings popup.
3. **Enter API Key** (if not saved) and configure your settings:
- **Source Language**: Select the language of the original video (or set to auto-detect).
- **Target Language**: Choose the language for dubbing.
- **Number of Speakers**: Select the number of speakers (or set to auto-detect).
4. Click **Start Dubbing**.
5. **Dubbing Status** will display in the popup, and dubbed audio will play along with the video, with the original audio muted.

### License
This project is licensed under the MIT License - see the LICENSE file for details.

----
This README.md provides a comprehensive overview of LingoCub and should help users and contributors understand how to install and use the project.