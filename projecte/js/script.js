document.getElementById("loadMessage").addEventListener("click", () => {
    // Mostra el missatge abans de carregar el contingut
    document.getElementById("dailyMessage").innerHTML = "T'estimo els 365 dies de l'any, i cada dia tinc un motiu per fer-ho.";

    // Desactiva el botó
    const button = document.getElementById("loadMessage");
    button.disabled = true;
    button.style.display = 'none'; // Opcional: per ocultar visualment el botó

    // Càrrega l'Excel i mostra la fila corresponent al dia actual
    fetch('missatges.xlsx')
        .then(response => response.arrayBuffer())
        .then(data => {
            // Llegir el fitxer Excel
            const XLSX = window.XLSX;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0]; // Nom de la primera pestanya
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Obtenir la data actual
            const today = new Date();
            const todayString = today.toLocaleDateString("ca-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });

            // Buscar la fila que coincideixi amb la data actual
            const filaActual = rows.find((fila, index) => {
                if (index === 0) return false; // Ignorar la capçalera
                const excelDate = fila[1]; // La columna de la data
                if (excelDate == null) return false;
                const dataExcel = excelDateToJSDate(excelDate);
                const dataFormatada = dataExcel.toLocaleDateString("ca-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                });
                return dataFormatada === todayString;
            });

            // Comprovar si s'ha trobat la fila
            if (filaActual) {
                mostrarMissatge(filaActual);
            } else {
                document.getElementById("dailyMessage").innerHTML = `
                    <p>No hi ha cap missatge disponible pel dia d'avui (${todayString})! Això vol dir que segurament ja ha passat un any! Tot i així pots seguir recordant els motius de cada dia a la pestanya de "Mostrar els altres dies" </p>
                `;
            }
        })
        .catch(err => console.error("Error carregant l'Excel:", err));
});

function excelDateToJSDate(excelDate) {
    // Els valors de data d'Excel comencen a 1900-01-01
    const excelEpoch = new Date(1899, 11, 30); // Compte amb l'offset!
    return new Date(excelEpoch.getTime() + excelDate * 86400000); // Convertir dies a mil·lisegons
}

function mostrarMissatge(fila) {
    const [dia, data, frase, linkImatge, peuFoto, linkVideo] = fila;
    const container = document.getElementById("dailyMessage");

    // Convertir el número d'Excel a una data de JavaScript
    const dataExcel = excelDateToJSDate(data);

    // Format de la data correctament
    const dataFormatada = dataExcel.toLocaleDateString('ca-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Missatge base
    container.innerHTML = `
        <p><strong>Dia ${dia}: </strong> ${dataFormatada} </p>
        <p><strong>El motiu d'avui:</strong></p>
        <p> ${frase}</p>
    `;

    // Afegir contingut extra si existeix
    if (linkImatge && peuFoto) {
        container.innerHTML += `
            <div>
                <img src="${linkImatge}" alt="Imatge del dia" style="max-width: 100%; height: auto;">
                <p>${peuFoto}</p>
            </div>
        `;
    }

    if (linkVideo) {
        if (linkVideo.includes("youtube.com") || linkVideo.includes("youtu.be")) {
            // Cas d'un enllaç a YouTube
            const youtubeEmbed = linkVideo.replace("watch?v=", "embed/");
            container.innerHTML += `
                <div class="responsiveIframe" style="margin-top: 10px;">

                     <iframe src="${youtubeEmbed}" 
                        title="YouTube video" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                     </iframe>
                        
                </div>
            `;
        } else {
            // Cas d'un fitxer de vídeo local (MP4, WebM, Ogg, etc.)
            container.innerHTML += `
                <div style="margin-top: 10px;">
                        <video class="responsiveVideo" controls>
                            <source src="${linkVideo}" type="video/mp4">
                            El teu navegador no suporta la reproducció de vídeos.
                        </video>
                </div>
            `;
        }
    }
}






function iniciarCountdown() {
    const countdownElement = document.getElementById("countdownMessage");

    function updateCountdown() {
        const ara = new Date(); // Hora actual
        const demà = new Date(ara.getFullYear(), ara.getMonth(), ara.getDate() + 1); // Mitjanit de demà

        const diferència = demà - ara; // Diferència en mil·lisegons

        if (diferència > 0) {
            const hores = Math.floor(diferència / (1000 * 60 * 60));
            const minuts = Math.floor((diferència % (1000 * 60 * 60)) / (1000 * 60));
            const segons = Math.floor((diferència % (1000 * 60)) / 1000);

            countdownElement.textContent = `Queden ${hores}h ${minuts}m ${segons}s pel següent motiu.`;
        } else {
            countdownElement.textContent = "Ja és el següent dia!";
            clearInterval(interval); // Atura l'actualització un cop s'ha arribat a l'endemà
        }
    }

    updateCountdown(); // Executar immediatament per inicialitzar
    const interval = setInterval(updateCountdown, 1000); // Actualitzar cada segon
}

// Executar la funció de compte enrere en carregar la pàgina
iniciarCountdown();








































