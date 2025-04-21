'use strict';
import { openModal, closeModal } from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#search-action').addEventListener('click', function () {
        openModal();
    });
    
    document.querySelector('.close-modal').addEventListener('click', function () {
        closeModal();
    });
    
    document.querySelector('#modal').addEventListener('click', function () {
        closeModal();
    });
    
    document.querySelector('.modal-content').addEventListener('click', function (event) {
        event.stopPropagation();
    });
});