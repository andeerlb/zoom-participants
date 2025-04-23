# Zoom Participants

**Zoom Participants** is a browser extension that helps track attendance in Zoom meetings by comparing current participants with a predefined list of people and their assigned supervisors.

## 🧩 Overview

The extension allows you to:

- Load a list of expected participants from a JSON file.
- Automatically check who is present in the Zoom meeting.
- Display participants grouped by their assigned supervisors, indicating who is online and offline.
- Identify participants in the meeting who are not assigned to any supervisor.

## ⚙️ How to Use

1. Prepare a JSON file with the expected participants and their supervisors.
2. During a Zoom meeting, activate the extension.
3. The extension will analyze the participants and display:
   - Present participants grouped by supervisor.
   - Absent participants.
   - Unassigned participants not linked to any supervisor.

## 🛠️ Project Build

To generate the final version of the extension, you need to build the files using Webpack. Follow these steps to build the project:

### 1. Install Dependencies

If you haven't installed the project dependencies yet, run the following command in the root of the project:

- **Install dependencies**:  
`npm install`

This will install all the required packages needed for the project.

### 2. Build the Extension Files

After installing the dependencies, run the following command to build the extension:

- build for dev test `npm run dev`
- build for prod `npm run build`

This will:

- Compile and bundle the files using Webpack.
- Create a `dist/` folder in the project directory, containing the final files ready to be used as a browser extension.

### 3. Test the Extension in the Browser

Once the build is complete, the `dist/` folder will be created with the final files. To test the extension in your browser:

1. Open the browser and go to the extensions page:
   - **Chrome**: `chrome://extensions/`
2. Enable **Developer mode**.
3. Click on **Load unpacked**.
4. Select the `dist/` folder created after the build.

The extension will now be loaded and ready to use in your browser!