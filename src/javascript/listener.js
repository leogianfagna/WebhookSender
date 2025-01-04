const serverSelect = document.getElementById('server');


serverSelect.addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    const saveRef = selectedValue + "_version";
    const latestVersion = localStorage.getItem(saveRef);

    // Preenche a próxima versão apenas se encontrar
    if (latestVersion) {
        const versionParts = latestVersion.split('.').map(Number);
        versionParts[2] += 1;
        const newVersion = versionParts.join('.');
        document.getElementById('patch-version').value = newVersion;
    } else {
        document.getElementById('patch-version').value = "";
    }
});