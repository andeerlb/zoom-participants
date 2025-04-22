import { removeStorage, saveToStorage, getJsonFromUrl } from "./utils.js"
import { state } from "./index.js"

const showStatus = (message, color, statusDiv) => {
    statusDiv.textContent = message;
    statusDiv.style.color = color;
    statusDiv.classList.remove('hide');
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.classList.add('hide');
    }, 3000);
};

document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('jsonInput');
    const saveBtn = document.getElementById('saveBtn');
    const resetBtn = document.getElementById('resetBtn');
    const statusDiv = document.getElementById('configStatus');
    const jsonFileCheckbox = document.getElementById('jsonFileCheckbox');
    const jsonUrlEl = document.getElementById('jsonUrl');
    
    saveBtn.addEventListener('click', () => {
        try {
            let fetchJsonFromUrl = document.getElementById('jsonFileCheckbox').checked;
            if (fetchJsonFromUrl) {
                getJsonFromUrl(textarea, jsonUrlEl, statusDiv);
            } else {
                saveToStorage("json", JSON.parse(textarea.value));
            }
            state.refreshRequired = true;
            showStatus('JSON saved with success!', 'green', statusDiv);
            document.getElementById('refreshRequired').classList.remove('hide');
        } catch (error) {
            console.error(error);
            showStatus('Invalid Json. Check your format.', 'red', statusDiv);
        }
    });
    
    jsonFileCheckbox.addEventListener('change', (event) => {
        if (event.target.checked) {
            textarea.disabled = true;
        } else {
            textarea.disabled = false;
        }
    
        chrome.storage.local.set({ fetchJsonFromUrl: event.target.checked });
    });
    
    resetBtn.addEventListener('click', () => {
        removeStorage('json', () => {
            textarea.value = '';
            showStatus('JSON removed.', 'gray', statusDiv);
        });
    });
});