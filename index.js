var refreshRequired = false;

const saveJsonToStorage = (result) => {
    chrome.storage.local.set({ json: result });
}

const getStorage = (key, successCallback, errorCallback) => {
    chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
            if (errorCallback) errorCallback(chrome.runtime.lastError);
            return;
        }

        if (result[key] === undefined) {
            if (errorCallback) errorCallback(`Key "${key}" not found in storage.`);
        } else {
            successCallback(result[key]);
        }
    });
}

const getActiveTab = () => {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                resolve(tabs[0]);
            } else {
                reject("no active tab");
            }
        });
    });
}

const checkZoom = async () => {
    try {
        const tab = await getActiveTab();
        if (!tab.url.includes("zoom.us")) {
            document.getElementById("mainwrapper").remove();
            const warningDiv = document.createElement("div");
            warningDiv.id = "mainwrapper";
            warningDiv.innerHTML = "<p style='padding: 20px'>This extension only works on Zoom pages.</p>";
            document.body.appendChild(warningDiv);
            throw new Error("Extension quit: Page is not from Zoom");
        }
    } catch (error) {
        console.error("Erro:", error);
    }
}

checkZoom();

const withoutPeople = () => {
    document.getElementById('accordionContainer').innerHTML = "<p id='loading'>Loading...</p>";
}

withoutPeople();

const forceCheck = () => {
    refreshRequired = false;
    document.getElementById("refreshRequired").classList.add("hide");
    withoutPeople();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "forceCheck" });
    });
}

if (chrome) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.origin === "background" && message.action === "participants") {
            if (message.data) {
                let loadingEl = document.getElementById('loading');
                if (loadingEl) {
                    loadingEl.remove();
                }
                message.data.forEach(lead => {
                    accordionByLead(lead);
                })
            }
        }

        if (message.origin === "background" && message.action === "no_json_config") {
            document.getElementById('accordionContainer').innerHTML = "<p class='notifications'>You need to configure json, go to the settings page.</p>";
        }
    });

    forceCheck();
}

const showPage = (pageId) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

document.getElementById("home-btn").addEventListener("click", () => {
    showPage("home-page");
});

document.getElementById("config-btn").addEventListener("click", () => {
    showPage("config-page");
});

document.getElementById("reload-action").addEventListener("click", () => {
    showPage("home-page");
    forceCheck();
});

const accordionContainer = document.getElementById('accordionContainer');
const accordionByLead = (leadData) => {
    const accordion = document.createElement('button');
    accordion.classList.add('accordion');
    accordion.textContent = leadData.responsible + ` (on: ${leadData.online.length} / off: ${leadData.offline.length})`;

    const panel = document.createElement('div');
    panel.classList.add('panel');

    const onlineList = document.createElement('ul');
    const offlineList = document.createElement('ul');

    leadData.online.forEach(personName => {
        const li = document.createElement('li');
        li.textContent = personName;
        onlineList.appendChild(li);
    });

    leadData.offline.forEach(personName => {
        const li = document.createElement('li');
        li.textContent = personName;
        offlineList.appendChild(li);
    });

    if (onlineList.children.length > 0) {
        const onlineHeader = document.createElement('li');
        onlineHeader.textContent = 'Online:';
        onlineHeader.style.fontWeight = 'bold';
        onlineList.insertBefore(onlineHeader, onlineList.firstChild);
        panel.appendChild(onlineList);
    }

    if (offlineList.children.length > 0) {
        const offlineHeader = document.createElement('li');
        offlineHeader.textContent = 'Offline:';
        offlineHeader.style.fontWeight = 'bold';
        offlineList.insertBefore(offlineHeader, offlineList.firstChild);
        panel.appendChild(offlineList);
    }

    accordionContainer.appendChild(accordion);
    accordionContainer.appendChild(panel);

    accordion.addEventListener('click', () => {
        panel.classList.toggle('active');
        accordion.classList.toggle('active');

        if (panel.classList.contains('active')) {
            accordion.style.borderBottomRightRadius = "0px";
            accordion.style.borderBottomLeftRadius = "0px";
            accordion.style.marginBottom = "-5px";
        } else {
            accordion.style.borderBottomRightRadius = "8px";
            accordion.style.borderBottomLeftRadius = "8px";
            accordion.style.marginBottom = "0px";
        }
    });
}

const textarea = document.getElementById("jsonInput");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const statusDiv = document.getElementById("configStatus");
const jsonFileCheckbox = document.getElementById('jsonFileCheckbox');
const jsonUrlEl = document.getElementById("jsonUrl");

const getJsonFromUrl = () => {
    textarea.disabled = true;
    let jsonUrl = jsonUrlEl.value;
    chrome.storage.local.set({ jsonUrl: jsonUrl });

    fetch(jsonUrl)
        .then(response => response.json())
        .then(data => {
            saveJsonToStorage(data);
            textarea.value = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
            showStatus("Error fetching JSON.", "red");
        });
}

document.addEventListener("DOMContentLoaded", () => {
    getStorage("fetchJsonFromUrl", checked => {
        jsonFileCheckbox.checked = checked;
        if (checked) {
            getStorage("jsonUrl", jsonUrl => {
                jsonUrlEl.value = jsonUrl;
                getJsonFromUrl();
            });
        } else {
            getStorage("json", json => {
                if (json) {
                    textarea.value = JSON.stringify(json, null, 2);
                }
            })
        }
    }, () => {
        getStorage("json", json => {
            if (json) {
                textarea.value = JSON.stringify(json, null, 2);
            }
        })
    })

    jsonFileCheckbox.addEventListener('change', (event) => {
        if (event.target.checked) {
            textarea.disabled = true;
        } else {
            textarea.disabled = false;
        }

        chrome.storage.local.set({ fetchJsonFromUrl: event.target.checked });
    });
});

saveBtn.addEventListener("click", () => {
    try {
        let fetchJsonFromUrl = document.getElementById("jsonFileCheckbox").checked;
        if (fetchJsonFromUrl) {
            getJsonFromUrl();
        } else {
            saveJsonToStorage(JSON.parse(textarea.value));
        }
        refreshRequired = true;
        showStatus("JSON salved with success!", "green");
        document.getElementById("refreshRequired").classList.remove("hide");
    } catch (error) {
        showStatus("Invalid Json. Check your format.", "red");
    }
});

resetBtn.addEventListener("click", () => {
    chrome.storage.local.remove(["json"], () => {
        textarea.value = "";
        showStatus("JSON removed.", "gray");
    });
});

const showStatus = (message, color) => {
    statusDiv.textContent = message;
    statusDiv.style.color = color;
    statusDiv.classList.remove("hide");
    setTimeout(() => {
        statusDiv.textContent = "";
        statusDiv.classList.add("hide");
    }, 3000);
}