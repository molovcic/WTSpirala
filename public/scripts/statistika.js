const statistika = StatistikaNekretnina();


const testNekretnine = [{
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 232000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2023.",
    opis: "Sociis natoque penatibus.",
    upiti: [{
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium."
    },
    {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla."
    }]
},{
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 32000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2009.",
    opis: "Sociis natoque penatibus.",
    upiti: [{
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium."
    },
    {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla."
    }]
},{
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 232000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2003.",
    opis: "Sociis natoque penatibus.",
    upiti: [{
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium."
    },
    {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla."
    }]
},
{
    id: 2,
    tip_nekretnine: "Kuća",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [{
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt."
    }
    ]
},
{
    id: 3,
    tip_nekretnine: "Kuća",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [{
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt."
    }
    ]
},
{
    id: 4,
    tip_nekretnine: "Kuća",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [{
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt."
    }
    ]
}]

const testKorisnici = [{
    id: 1,
    ime: "Neko",
    prezime: "Nekic",
    username: "username1",
},
{
    id: 2,
    ime: "Neko2",
    prezime: "Nekic2",
    username: "username2",
}]

statistika.init(testNekretnine, testKorisnici);

function dodajPeriod() {
    const container = document.getElementById('periodi-container');
    const novaPeriodInputs = document.createElement('div');
    novaPeriodInputs.className = 'period-inputs';
    novaPeriodInputs.innerHTML = `
        <div class="input-group">
            <label>Od godine:</label>
            <input type="number" class="period-od" min="1900" max="2024">
        </div>
        <div class="input-group">
            <label>Do godine:</label>
            <input type="number" class="period-do" min="1900" max="2024">
        </div>
    `;
    container.appendChild(novaPeriodInputs);
}

function dodajRasponCijena() {
    const container = document.getElementById('cijene-container');
    const novaCijenaInputs = document.createElement('div');
    novaCijenaInputs.className = 'cijena-inputs';
    novaCijenaInputs.innerHTML = `
        <div class="input-group">
            <label>Od (KM):</label>
            <input type="number" class="cijena-od" min="0">
        </div>
        <div class="input-group">
            <label>Do (KM):</label>
            <input type="number" class="cijena-do" min="0">
        </div>
    `;
    container.appendChild(novaCijenaInputs);
}

function prikupiPeriode() {
    const periodInputs = document.querySelectorAll('.period-inputs');
    const periodi = [];

    periodInputs.forEach(periodInput => {
        const od = parseInt(periodInput.querySelector('.period-od').value);
        const do_ = parseInt(periodInput.querySelector('.period-do').value);
        if (!isNaN(od) && !isNaN(do_) && od <= do_) {
            periodi.push({ od, do: do_ });
        }
    });

    return periodi;
}

function prikupiRasponeCijena() {
    const cijenaInputs = document.querySelectorAll('.cijena-inputs');
    const rasponi = [];

    cijenaInputs.forEach(cijenaInput => {
        const od = parseInt(cijenaInput.querySelector('.cijena-od').value);
        const do_ = parseInt(cijenaInput.querySelector('.cijena-do').value);
        if (!isNaN(od) && !isNaN(do_) && od <= do_) {
            rasponi.push({ od, do: do_ });
        }
    });

    return rasponi;
}

function iscrtajHistogram() {
    const periodi = prikupiPeriode();
    const rasponiCijena = prikupiRasponeCijena();

    if (periodi.length === 0 || rasponiCijena.length === 0) {
        alert('Molimo unesite barem jedan period i jedan raspon cijena.');
        return;
    }

    const histogramPodaci = statistika.histogramCijena(periodi, rasponiCijena);
    const chartsContainer = document.getElementById('charts-container');
    chartsContainer.innerHTML = ''; 

    periodi.forEach((period, periodIndex) => {
        const chartWrapper = document.createElement('div');
        chartWrapper.className = 'chart-wrapper';
        const canvas = document.createElement('canvas');
        chartWrapper.appendChild(canvas);
        chartsContainer.appendChild(chartWrapper);

        const periodPodaci = histogramPodaci.filter(podatak => 
            podatak.indeksPerioda === periodIndex
        );

        const chartData = {
            labels: rasponiCijena.map(raspon => `${raspon.od}-${raspon.do} KM`),
            datasets: [{
                label: `Period ${period.od}-${period.do}`,
                data: periodPodaci.map(podatak => podatak.brojNekretnina),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };

        new Chart(canvas, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Broj nekretnina po rasponu cijena (${period.od}-${period.do})`
                    }
                }
            }
        });
    });
}