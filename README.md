## LingoCub
LingoCub is a Chrome extension that enables real-time dubbing for YouTube videos in multiple languages. This extension uses the ElevenLabs API to provide dubbed audio based on user-selected source and target languages. The extension seamlessly integrates with YouTube, muting the original video audio and synchronizing dubbed audio playback with the video.

### Features
- Real-Time Dubbing: Dub YouTube videos in real time into your preferred language.
- Customizable Settings: Choose your source language, target language, and specify the number of speakers for optimal dubbing.
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

### Disclaimer
#### Disclaimer for LingoCub

#### Content Usage
LingoCub is an unofficial tool designed to enhance YouTube video experiences by dubbing videos in real-time using the ElevenLabs API. LingoCub does not own or control YouTube or its content. Users are responsible for ensuring they have the right to alter or overlay audio on any video they view or use with this tool.

#### Third-Party API Integration
This app relies on the ElevenLabs API for audio generation, and all dubbed audio is generated based on information provided by ElevenLabs. Users are responsible for reviewing ElevenLabs’ privacy policy and terms of service, as data used for dubbing is managed by ElevenLabs and may be subject to its data handling policies.

#### Data Collection
LingoCub stores your API key locally and does not transmit it to third parties. Any data related to video URLs, language preferences, and dubbing requests is used solely for in-app functionality and is not stored or retained by LingoCub after usage.

#### Limitations and Errors
LingoCub’s performance may vary depending on YouTube’s restrictions, API limitations, or connection issues. We do not guarantee continuous functionality due to potential API updates, server limitations, or other service changes by YouTube or ElevenLabs.

#### Privacy and Security
By using this extension, users acknowledge and accept any associated risks, including potential disruptions in YouTube or ElevenLabs functionality. LingoCub is designed with user privacy in mind but cannot guarantee the privacy practices of third-party services or external links accessed through YouTube.

#### Non-Endorsement
This application is not endorsed or affiliated with YouTube, Google, or ElevenLabs. All trademarks and copyrights belong to their respective owners.

