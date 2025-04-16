
'use strict';

// Scroll and collect visible names
const collectAllVisibleParticipants = (sidebarParticipants) => {
    return new Promise(resolve => {
        let scrollTop = 0;
        const scrollStep = 100;
        const delay = 200; // wait between scrolls
        const collected = new Set();

        function scrollAndCollect() {
            const elements = document.querySelectorAll('span.participants-item__display-name');
            elements.forEach(el => collected.add(el.innerText.trim()));

            if (sidebarParticipants.scrollTop + sidebarParticipants.clientHeight >= sidebarParticipants.scrollHeight - 10) {
                resolve(collected);
                return;
            }

            scrollTop += scrollStep;
            sidebarParticipants.scrollTop = scrollTop;
            setTimeout(scrollAndCollect, delay);
        }

        // Start from top
        sidebarParticipants.scrollTop = 0;
        setTimeout(scrollAndCollect, delay);
    });
};

function getStorageSync() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['json'], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result.json);
            }
        });
    });
}

const loadConfig = async () => {
    try {
        let config = await getStorageSync();

        if(!config) {
            chrome.runtime.sendMessage({
                origin: 'zoom_script',
                action: 'no_json_config'
            });
            return [];
        }

        return config;
    } catch (error) {
        chrome.runtime.sendMessage({
            origin: 'zoom_script',
            action: 'no_json_config'
        });
        console.error('error fetch json', error);
    }
};

const checkParticipants = async (sidebarParticipants) => {    
    const currentVisibleNames = await collectAllVisibleParticipants(sidebarParticipants);

    let dataConfig = await loadConfig();

    if(!dataConfig || !dataConfig.length){
        return;
    }

    let newModel = dataConfig.map(data => {
        const online = data.people.filter(name => currentVisibleNames.has(name));
        const offline = data.people.filter(name => !currentVisibleNames.has(name));
        return {
            responsible: data.responsible,
            online,
            offline
        };
    });

    let unknownLeadArray = [];
    currentVisibleNames.forEach(name => {
        let found = false;
        for (let i = 0; i < dataConfig.length; i++) {
            if(dataConfig[i].people.includes(name)) {
                found = true;
                break;
            }
        }
        if(!found) {
            unknownLeadArray.push(name);   
        }
    });

    if (unknownLeadArray.length) {
        newModel.push({
            responsible: 'unknown',
            online: unknownLeadArray,
            offline: []
        });
    }

    chrome.runtime.sendMessage({
        origin: 'zoom_script',
        action: 'participants',
        data: newModel,
    });
};

const openSidebarParticipants = (callBack) => {
    const participantContainerBtn = document.querySelector('#participant');
    if (participantContainerBtn) {
        let sidebarParticipants = document.querySelector('#participants-ul');
        if (sidebarParticipants) {
            callBack(sidebarParticipants);
            return;
        }

        let button = participantContainerBtn.children[0];
        button.click();
        let interval = setInterval(() => {
            let sidebarParticipants = document.querySelector('#participants-ul');
            if (sidebarParticipants) {
                clearInterval(interval);
                callBack(sidebarParticipants);
            }
        }, 1000);
    }
};

const main = () => {

    let interval = setInterval(() => {
        let loadingZoom;
        if(window !== window.top) {
            loadingZoom = window.top.document.getElementById('wc-loading');
        } else {
            loadingZoom = document.getElementById('wc-loading');
        }

        if(!loadingZoom || !loadingZoom.style.display) {
            return;
        }
        clearInterval(interval);
        openSidebarParticipants(checkParticipants);
    });
};

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'forceCheck') {
        main();
    }
});