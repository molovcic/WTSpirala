function spojiNekretnine(divReferenca, instancaModula, tip_nekretnine) {
    // pozivanje metode za filtriranje
    const filtriraneNekretnine = instancaModula.filtrirajNekretnine({ tip_nekretnine: tip_nekretnine });
    
    // Ciscenje svih elemenata liste
    divReferenca.innerHTML = '';

    if (filtriraneNekretnine.length === 0) {
        divReferenca.innerHTML = '<p>Trenutno nema dostupnih nekretnina ovoga tipa.</p>';
    } else {
        filtriraneNekretnine.forEach(nekretnina => {
            // Construct the HTML string for each nekretnina
            let nekretninaHtml = `
                <div class="nekretnina ${tip_nekretnine === "Kuća" ? 'kuca' : tip_nekretnine === "Poslovni prostor" ? 'pp' : ''}">
                    <div class="slika-nekretnine">
                        <img src="../Resources/${nekretnina.id}.jpg" alt="${nekretnina.naziv}" />
                    </div>
                    <div class="detalji-nekretnine">
                        <h3>${nekretnina.naziv}</h3>
                        <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
                    </div>
                    <div class="cijena-nekretnine">
                        <p>Cijena: ${nekretnina.cijena} BAM</p>
                    </div>
                    <a href="../detalji.html?id=${nekretnina.id}" class="detalji-dugme">Detalji</a>
                </div>
            `;
            // Append the constructed HTML to the div
            divReferenca.innerHTML += nekretninaHtml;
        });
    }
}


const listaNekretnina = [{  }]

const listaKorisnika = [{   }]

const divStan = document.getElementById("stan");
const divKuca = document.getElementById("kuca");
const divPp = document.getElementById("pp");

//instanciranje modula
let nekretnine = SpisakNekretnina();

PoziviAjax.getNekretnine((err, data) => {
    if (err) {
        console.error(err);
    } else {
        nekretnine.init(data, listaKorisnika);
        spojiNekretnine(divStan, nekretnine, "Stan");
        spojiNekretnine(divKuca, nekretnine, "Kuća");
        spojiNekretnine(divPp, nekretnine, "Poslovni prostor");
    }
});

