# Edit-Generation-Model - Walkthrough

## How to Install
1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer mode** (toggle in the top right).
3.  Click **Load unpacked**.
4.  Select the folder: `/Users/manvisharma/Documents/My Projects/Meeting Agent`.

## How to Test
1.  **Open a Meeting (or Simulator)**
    *   Open a new tab and go to a YouTube video with speech (e.g., a TED Talk).
    *   Or join a Google Meet call.

2.  **Start Recording**
    *   Click the **Meeting Agent** icon in your toolbar.
    *   Click **Start Recording**.
    *   *Note: You might be asked to select the tab to share. Select the current tab and ensure "Share tab audio" is checked.*

3.  **Verify Capture**
    *   Let the video/meeting play for 10-20 seconds.
    *   You should see the "Stop Recording" button is active in the popup.

4.  **Stop & View Summary**
    *   Click **Stop Recording** in the popup.
    *   Click **Open Dashboard**.
    *   You should see a new entry in the list.
    *   Click **Show Transcript** to see the text.
    *   Click **Generate Summary** to see the AI summary.
    *   *Note: Ensure the Python backend is running for this to work!*

## Running the Python Backend
1.  **Install Dependencies**:
    ```bash
    cd server
    pip install -r requirements.txt
    ```
2.  **Start Server**:
    ```bash
    uvicorn main:app --reload
    ```
    *   You should see: `Uvicorn running on http://127.0.0.1:8000`

## Troubleshooting
*   **Backend Error?** Make sure the Python server is running in a separate terminal.
*   **No Transcript?** Make sure you selected the correct tab and "Share tab audio" was enabled when the permission prompt appeared.
*   **Error?** Check the extension errors in `chrome://extensions`.
