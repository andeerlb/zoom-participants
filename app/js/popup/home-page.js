'use strict';

export const summary = (accordionContainer, data) => {
    const homePageContainer = document.getElementById('home-page');
    const summaryContainer = document.createElement('div');
    summaryContainer.id = 'summary';

    let onlineCount = 0;
    let offlineCount = 0;
    let unknownOnlineCount = 0;

    data.forEach(item => {

        if (item.groupedBy === 'unknown') {
            unknownOnlineCount += item.online.length;
        } else {
            onlineCount += item.online.length;
            offlineCount += item.offline.length;

            if(item.responsibleOnline) {
                onlineCount++;
            } else {
                offlineCount++;
            }
        }
    });


    summaryContainer.innerHTML = `<p>on: ${onlineCount}</p>`;
    summaryContainer.innerHTML += `<p>off: ${offlineCount}</p>`;
    summaryContainer.innerHTML += `<p>unkown: ${unknownOnlineCount}</p>`;

    homePageContainer.insertBefore(summaryContainer, accordionContainer);
};

export const accordionByGroup = (accordionContainer, groupData) => {
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