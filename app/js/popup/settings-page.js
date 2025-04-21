import { removeStorage, saveToStorage } from "./utils.js"

const showStatus = (message, color, statusDiv) => {
    statusDiv.textContent = message;
    statusDiv.style.color = color;
    statusDiv.classList.remove('hide');
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.classList.add('hide');
    }, 3000);
};

const getJsonFromUrl = (textarea, jsonUrlEl, statusDiv) => {
    textarea.disabled = true;
    let jsonUrl = jsonUrlEl.value;
    chrome.storage.local.set({ jsonUrl: jsonUrl });

    fetch(jsonUrl)
        .then(response => response.json())
        .then(data => {
            saveToStorage(data);
            textarea.value = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
            showStatus('Error fetching JSON.', 'red', statusDiv);
        });
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
                saveToStorage(JSON.parse(textarea.value));
            }
            refreshRequired = true;
            showStatus('JSON saved with success!', 'green');
            document.getElementById('refreshRequired').classList.remove('hide');
        } catch (error) {
            showStatus('Invalid Json. Check your format.', 'red');
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