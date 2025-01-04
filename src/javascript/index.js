function showDiv(div) {
    hideDiv();
    document.getElementById(div).classList.remove('hide-content');
}

function hideDiv() {
    document.getElementById('patchnotes-div').classList.add('hide-content');
    document.getElementById('events-div').classList.add('hide-content');
    document.getElementById('status-div').classList.add('hide-content');
}

