
'use strict';

const INTERLVAL_MS = 1000;

const collectAllVisibleParticipants = async (sidebarParticipants) => {
    const collected = new Set();
    const scrollStep = 100;
    const delay = 200;

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const collectFromDOM = () => {
        const elements = sidebarParticipants.querySelectorAll('span.participants-item__display-name');
        elements.forEach(el => collected.add(el.innerText.trim()));
    };

    sidebarParticipants.scrollTop = 0;
    await sleep(delay);

    while (true) {
        collectFromDOM();

        const { scrollTop, scrollHeight, clientHeight } = sidebarParticipants;
        if (scrollTop + clientHeight >= scrollHeight - 10) break;

        sidebarParticipants.scrollTop += scrollStep;
        await sleep(delay);
    }

    return collected;
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

        if (!config) {
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

const checkParticipants = async (configState, sidebarParticipants) => {
    const currentVisibleNames = await collectAllVisibleParticipants(sidebarParticipants);

    let newModel = configState.map(data => {
        const online = data.people.filter(name => currentVisibleNames.has(name));
        const offline = data.people.filter(name => !currentVisibleNames.has(name));
        const responsibleOnline = currentVisibleNames.has(data.groupedBy);
        return {
            groupedBy: data.groupedBy,
            responsibleOnline,
            online,
            offline
        };
    });

    let unknownLeadArray = [];
    currentVisibleNames.forEach(name => {
        let found = false;
        for (let i = 0; i < configState.length; i++) {
            if (configState[i].groupedBy.includes(name) || configState[i].people.includes(name)) {
                found = true;
                break;
            }
        }
        if (!found) {
            unknownLeadArray.push(name);
        }
    });

    if (unknownLeadArray.length) {
        newModel.push({
            groupedBy: 'unknown',
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

const openSidebarParticipants = (configState, iframeElement) => {
    let intervalClick = setInterval(() => {
        const participantContainerBtn = iframeElement.querySelector('#participant');
        let sidebarParticipants = iframeElement.querySelector('#participants-ul');

        if (sidebarParticipants) {
            clearInterval(intervalClick);
            checkParticipants(configState, sidebarParticipants);
            return;
        } else {
            sidebarParticipants = iframeElement.querySelector('#participant-window');
            if(sidebarParticipants) {
                clearInterval(intervalClick);
                checkParticipants(configState, sidebarParticipants);
                return;
            }
        }

        if (!participantContainerBtn) {
            const svg = iframeElement.querySelector('.SvgParticipants');
            if (!svg) {
                const moreBtn = iframeElement.querySelector('#moreButton');
                if (!moreBtn) return;

                const btn = moreBtn.querySelector('button');
                if (btn) btn.click();
                return;
            }

            const mobileVersionBtn = svg.parentElement;
            if (mobileVersionBtn) mobileVersionBtn.nextElementSibling.click();

            return;
        }

        const button = participantContainerBtn.children[0];
        if (button) button.click();

        clearInterval(intervalClick);

        const intervalParticipants = setInterval(() => {
            const sidebar = iframeElement.querySelector('#participants-ul');
            if (!sidebar) return;

            clearInterval(intervalParticipants);
            checkParticipants(configState, sidebar);
        }, INTERLVAL_MS);
    }, INTERLVAL_MS);
};  

const findWcLoading = (doc) => {
    try {
        return doc.getElementById('wc-loading');
    } catch (e) {
        return null;
    }
};

const main = async () => {
    let configState = await loadConfig();
    if(!configState || !configState.length) {
        return;
    }

    let intervalIframe = setInterval(() => {
        let loadingZoom = findWcLoading(document);
        let iframeElement;
        if (!loadingZoom) {
            const iframes = document.getElementsByTagName('iframe');
            for (let iframe of iframes) {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const found = findWcLoading(iframeDoc);
                    if (found) {
                        loadingZoom = found;
                        iframeElement = iframeDoc;
                        break;
                    }
                } catch (e) {
                    console.error('error when trying to access iframe:', e);
                }
            }
        }

        if (!loadingZoom || !loadingZoom.style || !loadingZoom.style.display || !iframeElement) {
            return;
        }

        clearInterval(intervalIframe);
        openSidebarParticipants(configState, iframeElement);
    }, INTERLVAL_MS);
};

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'refresh') {
        main();
    }
});