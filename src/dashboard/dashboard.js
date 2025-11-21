document.addEventListener('DOMContentLoaded', async () => {
    renderMeetings();
    renderLogs();

    document.getElementById('refresh-logs').addEventListener('click', renderLogs);
    document.getElementById('clear-logs').addEventListener('click', async () => {
        await chrome.storage.local.remove('logs');
        renderLogs();
    });
});

async function renderLogs() {
    const data = await chrome.storage.local.get('logs');
    const logs = (data.logs || []).reverse();
    const container = document.getElementById('log-container');
    container.textContent = logs.join('\n') || 'No logs found.';
}

async function renderMeetings() {
    const data = await chrome.storage.local.get('meetings');
    const meetings = (data.meetings || []).reverse(); // Show newest first

    const list = document.getElementById('meeting-list');
    list.innerHTML = '';

    if (meetings.length === 0) {
        list.innerHTML = '<p>No meetings recorded yet.</p>';
        return;
    }

    meetings.forEach((meeting, index) => {
        const item = document.createElement('div');
        item.className = 'meeting-card';

        const date = new Date(meeting.timestamp).toLocaleString();
        const summaryHtml = meeting.summary ?
            `<div class="summary-section">
         <h4>Summary</h4>
         <p>${meeting.summary}</p>
         <h4>Tasks</h4>
         <ul>${meeting.tasks.map(t => `<li>${t}</li>`).join('')}</ul>
       </div>` :
            `<button class="btn primary generate-btn" data-index="${index}">Generate Summary</button>`;

        item.innerHTML = `
      <div class="meeting-header">
        <h3>${meeting.title || 'Meeting ' + date}</h3>
        <span class="date">${date}</span>
      </div>
      <details>
        <summary>Show Transcript</summary>
        <p class="transcript-text">${meeting.transcript || 'No transcript available.'}</p>
      </details>
      <div class="action-area" id="action-${index}">
        ${summaryHtml}
      </div>
    `;
        list.appendChild(item);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.generate-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            generateSummary(index, meetings);
        });
    });
}

async function generateSummary(index, meetings) {
    const btn = document.querySelector(`.generate-btn[data-index="${index}"]`);
    btn.textContent = "Generating...";
    btn.disabled = true;

    const meeting = meetings[index];

    try {
        // Call Python Backend
        const response = await fetch('http://localhost:8000/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                transcript: meeting.transcript
            })
        });

        if (!response.ok) {
            throw new Error('Backend failed');
        }

        const result = await response.json();

        meeting.summary = result.summary;
        meeting.tasks = result.tasks;

        // Update storage
        const originalData = await chrome.storage.local.get('meetings');
        // Find the correct meeting to update in the original array
        // We match by timestamp to be safe
        const realIndex = originalData.meetings.findIndex(m => m.timestamp === meeting.timestamp);

        if (realIndex !== -1) {
            originalData.meetings[realIndex] = meeting;
            await chrome.storage.local.set({ meetings: originalData.meetings });
        }

        renderMeetings();

    } catch (error) {
        console.error('Error generating summary:', error);
        btn.textContent = "Error - Is Server Running?";
        btn.disabled = false;
        alert("Could not connect to Python Backend. Make sure 'uvicorn server.main:app --reload' is running on port 8000!");
    }
}
