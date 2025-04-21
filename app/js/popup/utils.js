export const withoutPeople = () => {
    document.getElementById('accordionContainer').innerHTML = '<p id=\'loading\'>Loading...</p>';
};

export const getStorage = (key, successCallback, errorCallback, finallyCallback) => {
    chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
            if (errorCallback) errorCallback(chrome.runtime.lastError);
            if(finallyCallback) {
                finallyCallback();
            }
            return;
        }

        if (result[key] === undefined) {
            if (errorCallback) errorCallback(`Key "${key}" not found in storage.`);
        } else {
            successCallback(result[key]);
        }

        if(finallyCallback) {
            finallyCallback();
        }
    });
};

export const getActiveTab = () => {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                resolve(tabs[0]);
            } else {
                reject('no active tab');
            }
        });
    });
};

export const checkZoom = async () => {
    try {
        const tab = await getActiveTab();
        if (!tab.url.includes('zoom.us')) {
            document.getElementById('mainwrapper').remove();
            const warningDiv = document.createElement('div');
            warningDiv.id = 'mainwrapper';
            warningDiv.innerHTML = '<p style=\'padding: 20px\'>This extension only works on Zoom pages.</p>';
            document.body.appendChild(warningDiv);
            throw new Error('Extension quit: Page is not from Zoom');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
};

export const refreshList = () => {
    document.getElementById('refreshRequired').classList.add('hide');
    let summaryEl = document.getElementById('summary');
    if(summaryEl) {
        summaryEl.remove();
    }
    withoutPeople();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'forceCheck' });
    });
};

export const saveToStorage = (key, value) => {
    chrome.storage.local.set({ [key]: value });
};

export const removeStorage = (key, callback) => {
    chrome.storage.local.remove([key], () => {
        callback();
    });
};

export const openModal = () => {
    let modalEl = document.querySelector('.modal');
    modalEl.classList.remove('hide');
}

export const closeModal = () => {
    let modalEl = document.querySelector('.modal');
    modalEl.classList.add('hide');
}