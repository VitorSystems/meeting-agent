document.getElementById('startBtn').addEventListener('click', async () => {
    log('Popup: Start button clicked');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Get the stream ID for the current tab
    chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id }, (streamId) => {
        if (chrome.runtime.lastError) {
            log(`Popup Error: ${chrome.runtime.lastError.message}`);
            console.error(chrome.runtime.lastError);
            return;
        }

        log('Popup: Stream ID obtained, sending to offscreen');
        // Send to background to forward to offscreen
        chrome.runtime.sendMessage({
            target: 'offscreen',
            type: 'start-recording',
            streamId: streamId
        });

        updateUI(true);
    });
});

async function log(msg) {
    const data = await chrome.storage.local.get('logs');
    const logs = data.logs || [];
    logs.push(`[Popup] ${new Date().toLocaleTimeString()}: ${msg}`);
    await chrome.storage.local.set({ logs });
}

document.getElementById('stopBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({
        target: 'offscreen',
        type: 'stop-recording'
    });
    updateUI(false);
});

document.getElementById('dashboardBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'src/dashboard/dashboard.html' });
});

function updateUI(isRecording) {
    document.getElementById('startBtn').disabled = isRecording;
    document.getElementById('stopBtn').disabled = !isRecording;
}
