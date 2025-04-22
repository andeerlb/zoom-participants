'use strict';
import '../../style.css';
import { checkZoom, withoutPeople, getStorage, refreshList, getJsonFromUrl } from './utils.js';
import { createListener } from './home-page.js';

export const state = {
    refreshRequired: false,
    refreshOnWay: false
};

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
        createListener();
        refreshList();
    });
});