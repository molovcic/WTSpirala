function postaviCarousel(sviElementi, indeks = 0) {
    if (!Array.isArray(sviElementi) || sviElementi.length === 0) {
        console.error("Niz elemenata je prazan ili nije validan.");
        return null;
    }

    if (indeks < 0 || indeks >= sviElementi.length) {
        console.error("Indeks je van granica niza.");
        return null;
    }

    let trenutniIndeks = indeks;

    // Funkcija koja prikazuje samo trenutni element
    const prikaziElement = () => {
        sviElementi.forEach((element, i) => {
            element.style.display = i === trenutniIndeks ? 'block' : 'none';
        });
    };

    prikaziElement(); // Prikaži početni element

    // Funkcija za navigaciju ulijevo
    const fnLijevo = () => {
        trenutniIndeks = (trenutniIndeks - 1 + sviElementi.length) % sviElementi.length;
        prikaziElement();
    };

    // Funkcija za navigaciju udesno
    const fnDesno = () => {
        trenutniIndeks = (trenutniIndeks + 1) % sviElementi.length;
        prikaziElement();
    };

    return {
        fnLijevo,
        fnDesno
    };
}
