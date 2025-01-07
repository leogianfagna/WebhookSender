const serverSelect = document.getElementById('patch-server');

serverSelect.addEventListener('change', (event) => {
    const selectedValue = event.target.value;

    const latestVersion = localStorage.getItem(selectedValue + "_version");
    const draftSaved = localStorage.getItem(selectedValue + "_draft");

    // Preenche a próxima versão apenas se encontrar
    if (latestVersion) {
        const versionParts = latestVersion.split('.').map(Number);
        versionParts[2] += 1;
        const newVersion = versionParts.join('.');
        document.getElementById('patch-version').value = newVersion;
    } else {
        document.getElementById('patch-version').value = "";
    }

    // Preenche com o rascunho salvo
    if (draftSaved) {
        document.getElementById('patch-content').value = draftSaved;
    } else {
        document.getElementById('patch-content').value = "";
    }
});