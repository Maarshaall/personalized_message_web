document.addEventListener("DOMContentLoaded", () => {
    const daysList = document.getElementById("daysList");

    fetch('missatges.xlsx')
        .then(response => response.arrayBuffer())
        .then(data => {
            const XLSX = window.XLSX;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const today = new Date();
            const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            // Generar la llista de dies fins al dia actual
            rows.slice(1).forEach((fila, index) => {
                const [dia, data, frase, linkImatge, peuFoto, linkVideo] = fila;
                const dataExcel = new Date((data - 25569) * 86400 * 1000); // Converteix la data d'Excel

                if (dataExcel <= todayMidnight) {
                    const li = document.createElement("li");
                    li.textContent = `Dia ${index + 1}: ${dataExcel.toLocaleDateString("ca-ES")}`;

                    li.addEventListener("click", () => {
                        // Elimina altres missatges visibles
                        document.querySelectorAll(".messageContainer").forEach(el => el.remove());

                        // Si el missatge no existeix, crea'l i mostra'l
                        if (!li.querySelector(".messageContainer")) {
                            const messageContainer = document.createElement("div");
                            messageContainer.classList.add("messageContainer");
                            mostrarMissatge(fila, messageContainer);
                            li.appendChild(messageContainer);
                        }
                    });

                    daysList.appendChild(li);
                }
            });
        })
        .catch(err => console.error("Error carregant l'Excel:", err));

    function mostrarMissatge(fila, container) {
        const [dia, data, frase, linkImatge, peuFoto, linkVideo] = fila;
        const dataExcel = new Date((data - 25569) * 86400 * 1000);
        const dataFormatada = dataExcel.toLocaleDateString("ca-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        container.innerHTML = `
            <div class="dailyMessage">
                <p><strong>Dia ${dia}:</strong> ${dataFormatada}</p>
                <p><strong>El motiu d'avui:</strong></p>
                <p>${frase}</p>
        `;

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
                        <video class="responsiveVideo" controls playsinline autoplay muted>
                            <source src="${linkVideo}" type="video/mp4">
                            El teu navegador no suporta la reproducció de vídeos.
                        </video>
                    </div>
                `;
            }
        }

        container.innerHTML += `</div>`;
    }
});




