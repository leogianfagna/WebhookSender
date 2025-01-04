const serverSelect = document.getElementById('server');
const patchNotes = document.getElementById("patch").value;


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
    console.log(draftSaved);
    if (draftSaved) {
        document.getElementById('patch').value = draftSaved;
    } else {
        document.getElementById('patch').value = "";
    }
});