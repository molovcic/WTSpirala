window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        document.getElementById('detalji').innerHTML = '<p>Nekretnina nije pronađena.</p>';
        return;
    }

    function updateNekretninaDetails(nekretnina) {
        const osnovnoDiv = document.getElementById('osnovno');
        const detaljiDiv = document.getElementById('detalji');
        const upitiDiv = document.getElementById('upiti');

        osnovnoDiv.innerHTML = '';
        detaljiDiv.innerHTML = '';
        upitiDiv.innerHTML = '';

        osnovnoDiv.innerHTML = `
            <img src="/Resources/stan/default.jpg" alt="${nekretnina.naziv}" />
            <p><strong>Naziv:</strong> ${nekretnina.naziv}</p>
            <p><strong>Kvadratura:</strong> ${nekretnina.kvadratura} m²</p>
            <p><strong>Cijena:</strong> ${nekretnina.cijena} KM</p>
        `;

        detaljiDiv.innerHTML = `
            <div id="kolona1">
                <p><strong>Tip grijanja:</strong> ${nekretnina.tip_grijanja}</p>
                <p><strong>Lokacija:</strong> <a href="top5.html?linkText=${encodeURIComponent(nekretnina.lokacija)}">${nekretnina.lokacija}</a></p>
            </div>
            <div id="kolona2">
                <p><strong>Godina izgradnje:</strong> ${nekretnina.godina_izgradnje}</p>
                <p><strong>Datum objave oglasa:</strong> ${nekretnina.datum_objave}</p>
            </div>
            <div id="opis">
                <p><strong>Opis:</strong> ${nekretnina.opis}</p>
            </div>
        `;

        nekretnina.upiti.forEach((upit, index) => {
            upitiDiv.innerHTML += `
                <div class="upit" id="upit${index + 1}">
                    <p><strong>${upit.username}:</strong></p>
                    <p>${upit.poruka}</p>
                </div>
            `;
        });

        const btnNazad = document.getElementById('nazad');
        const btnNaprijed = document.getElementById('naprijed');
        if (nekretnina.upiti.length > 1) {
            btnNazad.style.display = 'inline-block';
            btnNaprijed.style.display = 'inline-block';
        } else {
            btnNazad.style.display = 'none';
            btnNaprijed.style.display = 'none';
        }
    }

    PoziviAjax.getNekretnina(id, function(error, nekretnina) {
        if (error) {
            console.error(error);
        } else {
            updateNekretninaDetails(nekretnina);
        }
    });
};
