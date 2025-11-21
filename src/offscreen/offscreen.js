// Offscreen document script

chrome.runtime.onMessage.addListener((message) => {
    if (message.target === 'offscreen') {
        switch (message.type) {
            case 'start-recording':
                log('Received start-recording message');
                startRecording(message.streamId);
                break;
            case 'stop-recording':
                log('Received stop-recording message');
                stopRecording();
                break;
            default:
                console.warn(`Unexpected message type: ${message.type}`);
        }
    }
});

async function log(msg) {
    console.log(msg);
    const data = await chrome.storage.local.get('logs');
    const logs = data.logs || [];
    logs.push(`[Offscreen] ${new Date().toLocaleTimeString()}: ${msg}`);
    await chrome.storage.local.set({ logs });
}

let recognition;
let isRecording = false;
let currentTranscript = "";

async function startRecording(streamId) {
    if (isRecording) {
        log('Already recording');
        return;
    }

    try {
        log('Requesting user media...');
        const media = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: streamId
                }
            },
            video: false
        });
        log('User media obtained');

        // Continue to play the captured audio to the user.
        const output = new AudioContext();
        const source = output.createMediaStreamSource(media);
        source.connect(output.destination);

        startTranscription(media);
        isRecording = true;

        // Initialize storage for this session
        const timestamp = Date.now();
        await chrome.storage.local.set({
            currentMeeting: {
                timestamp,
                transcript: ""
            }
        });
        log('Recording started');

    } catch (err) {
        log(`Error starting recording: ${err.message}`);
        console.error('Error starting recording:', err);
    }
}

function startTranscription(stream) {
    try {
        if (!('webkitSpeechRecognition' in self)) {
            throw new Error('webkitSpeechRecognition not available');
        }
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                currentTranscript += finalTranscript + " ";
                updateStorage(currentTranscript);
                log(`Transcript updated: ${finalTranscript.substring(0, 20)}...`);
            }
        };

        recognition.onerror = (event) => {
            log(`Speech recognition error: ${event.error}`);
            console.error('Speech recognition error', event.error);
        };

        recognition.onstart = () => {
            log('Speech recognition started');
        };

        recognition.start();
    } catch (e) {
        log(`Error starting transcription: ${e.message}`);
        console.error(e);
    }
}

async function updateStorage(text) {
    const data = await chrome.storage.local.get('currentMeeting');
    if (data.currentMeeting) {
        data.currentMeeting.transcript = text;
        await chrome.storage.local.set({ currentMeeting: data.currentMeeting });
    }
}

function stopRecording() {
    if (!isRecording) return;

    if (recognition) {
        recognition.stop();
    }
    isRecording = false;

    // Archive the meeting
    chrome.storage.local.get(['meetings', 'currentMeeting'], (data) => {
        const meetings = data.meetings || [];
        if (data.currentMeeting) {
            meetings.push(data.currentMeeting);
            chrome.storage.local.set({ meetings, currentMeeting: null });
        }
    });
}
