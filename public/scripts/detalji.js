window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    let currentIndex = 0;
    let currentZahtjevIndex = 0;
    let currentPonudaIndex = 0;
    let allUpiti = [];
    let allZahtjevi = [];
    let allPonude = [];
    let isLastPage = false;
    let loadedPages = new Set();

    if (!id) {
        document.getElementById('detalji').innerHTML = '<p>Nekretnina nije pronađena, molim vas izaberite jednu iz liste nekretnina</p>';
        return;
    }

    function updateNekretninaDetails(nekretnina, interesovanja) {
        const osnovnoDiv = document.getElementById('osnovno');
        const detaljiDiv = document.getElementById('detalji');

        osnovnoDiv.innerHTML = `
            <img src="/Resources/stan/default.jpg" alt="${nekretnina.nekretnina.naziv}" />
            <p><strong>Naziv:</strong> ${nekretnina.nekretnina.naziv}</p>
            <p><strong>Kvadratura:</strong> ${nekretnina.nekretnina.kvadratura} m²</p>
            <p><strong>Cijena:</strong> ${nekretnina.nekretnina.cijena} KM</p>
        `;

        detaljiDiv.innerHTML = `
            <div id="kolona1">
                <p><strong>Tip grijanja:</strong> ${nekretnina.nekretnina.tip_grijanja}</p>
                <p><strong>Lokacija:</strong> <a href="top5.html?linkText=${encodeURIComponent(nekretnina.nekretnina.lokacija)}">${nekretnina.nekretnina.lokacija}</a></p>
            </div>
            <div id="kolona2">
                <p><strong>Godina izgradnje:</strong> ${nekretnina.nekretnina.godina_izgradnje}</p>
                <p><strong>Datum objave oglasa:</strong> ${nekretnina.nekretnina.datum_objave}</p>
            </div>
            <div id="opis">
                <p><strong>Opis:</strong> ${nekretnina.nekretnina.opis}</p>
            </div>
        `;

        if (interesovanja.upiti && interesovanja.upiti.length > 0) {
            allUpiti = interesovanja.upiti;
            console.log(allUpiti);
            displayCurrentUpit();
        }
        else if (nekretnina.upiti.length === 0) {
            const upitiDiv = document.getElementById('upiti');
            upitiDiv.innerHTML = '';
            const upitDiv = document.createElement('div');
            upitDiv.className = 'upit';
            upitDiv.innerHTML = `
                <p><strong>Nekretnina nema upita</strong></p>
            `;
            upitiDiv.appendChild(upitDiv);
        }
        if (interesovanja.ponude && interesovanja.ponude.length > 0) {
            allPonude = interesovanja.ponude;
            displayCurrentPonuda();
        }
        else if (interesovanja.ponude.length === 0) {
            const ponudeDiv = document.getElementById('ponude');
            ponudeDiv.innerHTML = '';
            const ponudaDiv = document.createElement('div');
            ponudaDiv.className = 'ponuda';
            ponudaDiv.innerHTML = `
                <p><strong>Nekretnina nema ponuda</strong></p>
            `;
            ponudeDiv.appendChild(ponudaDiv);
        }

        if(interesovanja.zahtjevi && interesovanja.zahtjevi.length > 0) {
            allZahtjevi = interesovanja.zahtjevi;
            displayCurrentZahtjev();
        }
        else if (interesovanja.zahtjevi.length === 0) {
            const zahtjeviDiv = document.getElementById('zahtjevi');
            zahtjeviDiv.innerHTML = '';
            const zahtjevDiv = document.createElement('div');
            zahtjevDiv.className = 'zahtjev';
            zahtjevDiv.innerHTML = `
                <p><strong>Nekretnina nema zahtjeva</strong></p>
            `;
            zahtjeviDiv.appendChild(zahtjevDiv);
        }
    }

    function displayCurrentUpit() {
        const upitiDiv = document.getElementById('upiti');
        
        const nazadBtn = document.getElementById('nazad');
        const naprijedBtn = document.getElementById('naprijed');
        upitiDiv.innerHTML = '';
        
        if (allUpiti.length > 0) {
            const currentUpit = allUpiti[currentIndex];
            const upitDiv = document.createElement('div');
            upitDiv.className = 'upit';
            upitDiv.innerHTML = `
                <p><strong>${currentUpit.KorisnikId}:</strong></p>
                <p>${currentUpit.tekst}</p>
            `;
            upitiDiv.appendChild(upitDiv);
        }

        const newNazadBtn = document.createElement('button');
        newNazadBtn.id = 'nazad';
        newNazadBtn.className = 'btn';
        newNazadBtn.textContent = 'Nazad';
        
        const newNaprijedBtn = document.createElement('button');
        newNaprijedBtn.id = 'naprijed';
        newNaprijedBtn.className = 'btn';

        newNaprijedBtn.textContent = 'Naprijed';
        
        upitiDiv.appendChild(newNazadBtn);
        upitiDiv.appendChild(newNaprijedBtn);
        
        document.getElementById('nazad').addEventListener('click', handlePrevious);
        document.getElementById('naprijed').addEventListener('click', handleNext);
    }

    function displayCurrentPonuda() {
        const zahtjeviDiv = document.getElementById('zahtjevi');
        
        const nazadBtn = document.getElementById('nazadZ');
        const naprijedBtn = document.getElementById('naprijedZ');
        zahtjeviDiv.innerHTML = '';
        
        if (allZahtjevi.length > 0) {
            const currentZahtjev = allZahtjevi[currentZahtjevIndex];
            const zahtjevDiv = document.createElement('div');
            zahtjevDiv.className = 'upit';
            zahtjevDiv.innerHTML = `
                <p><strong>${currentZahtjev.KorisnikId}:</strong></p>
                <p>${currentZahtjev.tekst}</p>
            `;
            zahtjeviDiv.appendChild(upitDiv);
        }

        const newNazadBtn = document.createElement('button');
        newNazadBtn.id = 'nazadZ';
        newNazadBtn.className = 'btn';
        newNazadBtn.textContent = 'Nazad';
        
        const newNaprijedBtn = document.createElement('button');
        newNaprijedBtn.id = 'naprijedZ';
        newNaprijedBtn.className = 'btn';
        newNaprijedBtn.textContent = 'Naprijed';
        
        zahtjeviDiv.appendChild(newNazadBtn);
        zahtjeviDiv.appendChild(newNaprijedBtn);
        
        document.getElementById('nazadZ').addEventListener('click', handlePreviousZahtjev);
        document.getElementById('naprijedZ').addEventListener('click', handleNextZahtjev);
    }

    function handlePrevious() {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = allUpiti.length - 1;
        }
        displayCurrentUpit();
    }

    function handleNext() {
        const nextIndex = currentIndex + 1;
        
        if (nextIndex < allUpiti.length) {
            currentIndex = nextIndex;
        } else {
            currentIndex = 0;
        }
        displayCurrentUpit();
    }

    PoziviAjax.getNekretnina(id, function(error, nekretnina) {
        if (error) {
            console.error(error);
        } else {
            PoziviAjax.getInteresovanja(id, function(error, interesovanja) {
                if (error) {
                    console.error(error);
                } else {
                    updateNekretninaDetails(nekretnina, interesovanja);
                }

            });
        }
    });
};