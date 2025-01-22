window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    let currentIndex = 0;
    let allUpiti = [];
    let isLastPage = false;
    let loadedPages = new Set();

    if (!id) {
        document.getElementById('detalji').innerHTML = '<p style="text-align:center">Nekretnina nije pronađena.</p>';
        return;
    }

    function updateNekretninaDetails(nekretnina) {
        const osnovnoDiv = document.getElementById('osnovno');
        const detaljiDiv = document.getElementById('detalji');

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

        if (nekretnina.upiti && nekretnina.upiti.length > 0) {
            allUpiti = nekretnina.upiti;
            displayCurrentUpit();
        }
    }

    function displayCurrentUpit() {
        const upitiDiv = document.getElementById('upiti');
        
        // Clear everything except buttons
        const nazadBtn = document.getElementById('nazad');
        const naprijedBtn = document.getElementById('naprijed');
        upitiDiv.innerHTML = '';
        
        if (allUpiti.length > 0) {
            const currentUpit = allUpiti[currentIndex];
            const upitDiv = document.createElement('div');
            upitDiv.className = 'upit';
            upitDiv.innerHTML = `
                <p><strong>${currentUpit.korisnik_id}:</strong></p>
                <p>${currentUpit.tekst_upita}</p>
            `;
            upitiDiv.appendChild(upitDiv);
        }

        // Create new buttons
        const newNazadBtn = document.createElement('button');
        newNazadBtn.id = 'nazad';
        newNazadBtn.textContent = 'Nazad';
        
        const newNaprijedBtn = document.createElement('button');
        newNaprijedBtn.id = 'naprijed';
        newNaprijedBtn.textContent = 'Naprijed';
        
        // Add buttons back
        upitiDiv.appendChild(newNazadBtn);
        upitiDiv.appendChild(newNaprijedBtn);
        
        // Add event listeners to new buttons
        document.getElementById('nazad').addEventListener('click', handlePrevious);
        document.getElementById('naprijed').addEventListener('click', handleNext);
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
        
        if (nextIndex >= allUpiti.length) {

            if (!isLastPage) {
                const nextPage = Math.floor(allUpiti.length / 3) + 1;
                if (!loadedPages.has(nextPage)) {
                    loadedPages.add(nextPage);
                    PoziviAjax.getNextUpiti(id, nextPage, (error, upiti) => {
                        if (error) {
                            console.error('Error fetching upiti:', error);
                            currentIndex = 0;
                            displayCurrentUpit();
                        } else if (upiti && upiti.length > 0) {

                            allUpiti = [...allUpiti, ...upiti];

                            currentIndex = nextIndex;
                            displayCurrentUpit();
                            
                            
                            if (nextIndex % 3 === 0 && !isLastPage) {
                                const followingPage = nextPage + 1;
                                if (!loadedPages.has(followingPage)) {
                                    loadedPages.add(followingPage);
                                    PoziviAjax.getNextUpiti(id, followingPage, (error, moreUpiti) => {
                                        if (moreUpiti && moreUpiti.length > 0) {
                                            allUpiti = [...allUpiti, ...moreUpiti];
                                        } else {
                                            isLastPage = true;
                                        }
                                    });
                                }
                            }
                        } else {
                            isLastPage = true;
                            currentIndex = 0;
                            displayCurrentUpit();
                        }
                    });
                } else {
                    currentIndex = 0;
                    displayCurrentUpit();
                }
            } else {
                currentIndex = 0;
                displayCurrentUpit();
            }
        } else {
            currentIndex = nextIndex;
            displayCurrentUpit();
            

            
            if ((currentIndex + 1) % 3 === 0 && !isLastPage) {
                const nextPage = Math.floor((currentIndex + 1) / 3) + 1;
                if (!loadedPages.has(nextPage)) {
                    loadedPages.add(nextPage);
                    PoziviAjax.getNextUpiti(id, nextPage, (error, upiti) => {
                        if (upiti && upiti.length > 0) {
                            allUpiti = [...allUpiti, ...upiti];
                        } else {
                            isLastPage = true;
                        }
                    });
                }
            }
        }
    }

    PoziviAjax.getNekretnina(id, function(error, nekretnina) {
        if (error) {
            console.error(error);
        } else {
            updateNekretninaDetails(nekretnina);
            if (nekretnina.upiti && nekretnina.upiti.length > 0) {
                const nextPage = 1; 
                loadedPages.add(nextPage);
                PoziviAjax.getNextUpiti(id, nextPage, (error, upiti) => {
                    if (upiti && upiti.length > 0) {
                        allUpiti = [...allUpiti, ...upiti];
                    } else {
                        isLastPage = true;
                    }
                });
            }
        }
    });
};