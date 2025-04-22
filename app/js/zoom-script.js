
'use strict';

const INTERLVAL_MS = 1000;

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

const checkParticipants = async (sidebarParticipants) => {
    const currentVisibleNames = await collectAllVisibleParticipants(sidebarParticipants);

    let dataConfig = await loadConfig();

    if (!dataConfig || !dataConfig.length) {
        return;
    }

    let newModel = dataConfig.map(data => {
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
        for (let i = 0; i < dataConfig.length; i++) {
            if (dataConfig[i].groupedBy.includes(name) || dataConfig[i].people.includes(name)) {
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

const openSidebarParticipants = (iframeElement, callBack) => {
    let intervalClick = setInterval(() => {
        const participantContainerBtn = iframeElement.querySelector('#participant');
        let sidebarParticipants = iframeElement.querySelector('#participants-ul');

        if (sidebarParticipants) {
            clearInterval(intervalClick);
            callBack(sidebarParticipants);
            return;
        } else {
            sidebarParticipants = iframeElement.querySelector("#participant-window");
            if(sidebarParticipants) {
                clearInterval(intervalClick);
                callBack(sidebarParticipants);
                return;
            }
        }

        if (!participantContainerBtn) {
            const svg = iframeElement.querySelector('.SvgParticipants');
            if (!svg) {
                const moreBtn = iframeElement.querySelector("#moreButton");
                if (!moreBtn) return;

                const btn = moreBtn.querySelector("button");
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
            callBack(sidebar);
        }, INTERLVAL_MS);
    }, INTERLVAL_MS);
};  

const findWcLoading = (doc) => {
    try {
        return doc.getElementById('wc-loading');
    } catch (e) {
        return null;
    }
}

const main = () => {
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
        openSidebarParticipants(iframeElement, checkParticipants);
    }, INTERLVAL_MS);
};

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'refresh') {
        main();
    }
});