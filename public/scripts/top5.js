document.addEventListener('DOMContentLoaded', () => {
    const top5Container = document.getElementById('top5-container');
    const errorMessage = document.getElementById('error-message');

    function getQueryParam(param) {
        var urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    var linkText = getQueryParam('linkText');

    if (linkText) {
        console.log('The link text is: ' + decodeURIComponent(linkText));
    }

    function prikaziTop5(top5) {
        top5Container.innerHTML = ''; 
        if (top5.length === 0) {
            top5Container.innerHTML = '<p>Nema upita za prikaz.</p>';
            return;
        }

        top5.forEach(nekretnina => {
            const topDiv = document.createElement('div');
            topDiv.classList.add('nekretnina');
            
            topDiv.innerHTML = `
                <div class="slika-nekretnine">
                    <img src="${top.image}" alt="Property Image" />
                </div>
                <div class="detalji-nekretnine">
                    <h3>Naziv: ${nekretnina.naziv}</h3>
                    <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
                </div>
                <div class="cijena-nekretnine">
                    <p>Cijena: ${nekretnina.cijena} BAM</p>
                </div>
                <div class="datum-postavljanja">
                    <p>Datum objave: ${nekretnina.datum_objave}</p>
                </div>
                <a href="../detalji.html?id=${nekretnina.id}" class="detalji-dugme">Detalji</a>
            `;
            
            top5Container.appendChild(topDiv);
        });
    }

    PoziviAjax.getTop5Nekretnina(decodeURIComponent(linkText), (error, top5) => {
        if (error) {
            errorMessage.textContent = `Greška pri dohvaćanju top 5: ${error.statusText || error}`;
        } else {
            prikaziTop5(top5);
        }
    });
});
