# Zoom Participants

This is a browser extension that checks which participants are present in a Zoom meeting, based on a predefined list of people and their respective responsible parties.

## Overview

The extension reads a JSON containing participant names and their assigned responsible persons. Once activated during a Zoom meeting, it checks who is present and displays:

- The list of participants grouped by their responsible and will show who is online and offline..
- Participants in the meeting who are not assigned to any responsible.

## Installation

Open your browser's extensions page:
- **Chrome**: `chrome://extensions`

Enable **Developer mode**.

Click **Load unpacked** and select the `zoom-participants` folder.

## Usage

1. Join a Zoom meeting using your browser.
2. Click the extension icon in the browser toolbar.
3. The extension will:
   - Read the predefined JSON list of participants and their responsible.
   - Compare it with the current Zoom meeting participants.
   - Display the participants grouped by their responsible.
   - Show which participants are present without an assigned responsible.

## File Structure

- `manifest.json` — Extension configuration  
- `index.html` — Popup interface  
- `index.js` — Main popup logic  
- `zoom_script.js` — Script injected into the Zoom page to collect data  
- `background.js` — Handles background operations  
- `style.css` — UI styling  
- `json_example.json` — Sample input json format  