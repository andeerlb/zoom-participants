'use strict';
import { checkZoom, withoutPeople, getStorage, refreshList } from "./utils.js";
import { createListener } from "./home-page.js";

export let refreshRequired = false;
export let refreshOnWay = false;

document.addEventListener('DOMContentLoaded', () => {
    checkZoom();
    withoutPeople();

    getStorage('fetchJsonFromUrl', checked => {
        jsonFileCheckbox.checked = checked;
        if (checked) {
            getStorage('jsonUrl', jsonUrl => {
                jsonUrlEl.value = jsonUrl;
                getJsonFromUrl();
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