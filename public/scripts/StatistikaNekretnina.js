let StatistikaNekretnina = function () {
    let _listaNekretnina = [];
    let _listaKorisnika = [];
    let _spisakNekretnina = SpisakNekretnina();

    let init = function (nekretnine, korisnici) {
        _listaNekretnina = nekretnine;
        _listaKorisnika = korisnici;
        _spisakNekretnina.init(nekretnine, korisnici);
    }

    let prosjecnaKvadratura = function (kriterij) {
        const filtriraneNekretnine = _spisakNekretnina.filtrirajNekretnine(kriterij);
        if (filtriraneNekretnine.length === 0) return 0;
        const suma = filtriraneNekretnine.reduce((acc, nekretnina) => acc + nekretnina.kvadratura, 0);
        return suma / filtriraneNekretnine.length;
    }

    let outlier = function (kriterij, nazivSvojstva) {
        const filtriraneNekretnine = _spisakNekretnina.filtrirajNekretnine(kriterij);
        if (filtriraneNekretnine.length === 0) return null;
        if (typeof filtriraneNekretnine[0][nazivSvojstva] !== 'number') return null;
        
        const srednjaVrijednost = filtriraneNekretnine.reduce((acc, nekretnina) =>
            acc + nekretnina[nazivSvojstva], 0) / filtriraneNekretnine.length;
        
        let maxOdstupanje = 0;
        let outlierNekretnina = null;
        
        filtriraneNekretnine.forEach(nekretnina => {
            const odstupanje = Math.abs(nekretnina[nazivSvojstva] - srednjaVrijednost);
            if (odstupanje > maxOdstupanje) {
                maxOdstupanje = odstupanje;
                outlierNekretnina = nekretnina;
            }
        });
        
        return outlierNekretnina;
    }

    let mojeNekretnine = function (korisnik) {
        const upitPoNekretnini = new Map();
        _listaNekretnina.forEach(nekretnina => {
            const brojUpita = (nekretnina.upiti || [])
                .filter(upit => upit.korisnik_id === korisnik.id)
                .length;
            if (brojUpita > 0) {
                upitPoNekretnini.set(nekretnina, brojUpita);
            }
        });
        
        return Array.from(upitPoNekretnini.entries())
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
    }

    let histogramCijena = function (periodi, rasponiCijena) {
        const rezultat = [];
        if (!Array.isArray(periodi) || !Array.isArray(rasponiCijena)) return rezultat;
    
        periodi.forEach((period, indeksPerioda) => {
            rasponiCijena.forEach((raspon, indeksRasponaCijena) => {
                const nekretnineUPeriodu = _listaNekretnina.filter(nekretnina => {
                    const godina = nekretnina.godina_izgradnje; 
                    return godina >= period.od && godina <= period.do;
                });
    
                const brojNekretnina = nekretnineUPeriodu.filter(nekretnina =>
                    nekretnina.cijena >= raspon.od && nekretnina.cijena <= raspon.do
                ).length;
    
                rezultat.push({
                    indeksPerioda,
                    indeksRasponaCijena,
                    brojNekretnina
                });
            });
        });
    
        return rezultat;
    }

    return {
        init: init,
        prosjecnaKvadratura: prosjecnaKvadratura,
        outlier: outlier,
        mojeNekretnine: mojeNekretnine,
        histogramCijena: histogramCijena
    }
};