'use strict';
import '../../style.css';
import { checkZoom, withoutPeople, getStorage, refreshList, getJsonFromUrl } from './utils.js';
import { state } from "./state.js";
import { summary, accordionByGroup } from "./home-page.js"

document.addEventListener('DOMContentLoaded', () => {
    checkZoom();
    withoutPeople();
    const textarea = document.getElementById('jsonInput');
    const jsonFileCheckbox = document.getElementById('jsonFileCheckbox');
    const jsonUrlEl = document.getElementById('jsonUrl');
    const statusDiv = document.getElementById('configStatus');

    getStorage('fetchJsonFromUrl', checked => {
        jsonFileCheckbox.checked = checked;
        if (checked) {
            getStorage('jsonUrl', jsonUrl => {
                jsonUrlEl.value = jsonUrl;
                getJsonFromUrl(textarea, jsonUrlEl, statusDiv);
            });
        } else {
            getStorage('json', json => {
                if (json) {
                    textarea.value = JSON.stringify(json, null, 2);
                }
            });
        }
    }, () => {
        getStorage('json', json => {
            if (json) {
                textarea.value = JSON.stringify(json, null, 2);
            }
        });
    }, () => {
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
        refreshList();
    });
});