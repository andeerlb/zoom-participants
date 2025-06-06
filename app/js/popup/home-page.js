'use strict';
import { state } from "./state.js";

const summary = (accordionContainer, data) => {
    const homePageContainer = document.getElementById('home-page');
    const summaryContainer = document.createElement('div');
    summaryContainer.id = 'summary';

    let onlineCount = 0;
    let offlineCount = 0;
    let unknownOnlineCount = 0;
    let total = 0;

    data.forEach(item => {
        if (item.groupedBy === 'unknown') {
            unknownOnlineCount += item.online.length;
        } else {
            total += item.online.length + item.offline.length + 1;
            onlineCount += item.online.length;
            offlineCount += item.offline.length;

            if(item.responsibleOnline) {
                onlineCount++;
            } else {
                offlineCount++;
            }
        }
    });


    summaryContainer.innerHTML = `<span>ON: <p>${onlineCount} of ${total}</p></span>`;
    summaryContainer.innerHTML += `<span>OFF: <p>${offlineCount}</p></span>`;

    if(unknownOnlineCount) {
        summaryContainer.innerHTML += `<span>UNKOWN: <p>${unknownOnlineCount}</p></span>`;
    }

    homePageContainer.insertBefore(summaryContainer, accordionContainer);
};

const accordionByGroup = (accordionContainer, groupData) => {
    const accordion = document.createElement('button');
    accordion.classList.add('accordion');
    accordion.textContent = `${groupData.groupedBy} (on: ${groupData.online.length} / off: ${groupData.offline.length})`;
    if(groupData.groupedBy !== 'unknown') {
        accordion.classList.add(groupData.responsibleOnline ? 'online' : 'offline');
    }


    const panel = document.createElement('div');
    panel.classList.add('panel');

    const onlineList = document.createElement('ul');
    const offlineList = document.createElement('ul');

    groupData.online.forEach(personName => {
        const li = document.createElement('li');
        li.textContent = personName;
        onlineList.appendChild(li);
    });

    groupData.offline.forEach(personName => {
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
            accordion.style.borderBottomRightRadius = '0px';
            accordion.style.borderBottomLeftRadius = '0px';
            accordion.style.marginBottom = '-5px';
        } else {
            accordion.style.borderBottomRightRadius = '8px';
            accordion.style.borderBottomLeftRadius = '8px';
            accordion.style.marginBottom = '0px';
        }
    });
};

export const createListener = () => {
    chrome.runtime.onMessage.addListener(message => {
        if (message.origin === 'background' && message.action === 'participants') {
            state.refreshRequired = false;
            state.refreshOnWay = false;
            if (message.data) {
                let loadingEl = document.getElementById('loading');
                if (loadingEl) {
                    loadingEl.remove();
                }

                const accordionContainer = document.getElementById('accordionContainer');
                summary(accordionContainer, message.data);
                message.data.forEach(group => {
                    accordionByGroup(accordionContainer, group);
                });
            }
        }

        if (message.origin === 'background' && message.action === 'no_json_config') {
            state.refreshOnWay = false;
            document.getElementById('accordionContainer').innerHTML = '<p class=\'notifications\'>You need to configure json, go to the settings page.</p>';
        }
    });
};