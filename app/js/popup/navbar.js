'use strict';
import { state } from "./state.js";
import { refreshList } from './utils.js';

const showPage = (pageId) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('home-btn').addEventListener('click', () => {
        showPage('home-page');
    });
    
    document.getElementById('config-btn').addEventListener('click', () => {
        showPage('config-page');
    });
    
    document.getElementById('reload-action').addEventListener('click', () => {
        showPage('home-page');
        if (!state.refreshOnWay) {
            state.refreshOnWay = true;
            refreshList();
        }
    });
});