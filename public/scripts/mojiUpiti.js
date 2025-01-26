document.addEventListener('DOMContentLoaded', () => {
    const upitiContainer = document.getElementById('upiti-container');
    const errorMessage = document.getElementById('error-message');

    function prikaziUpite(upiti) {
        upitiContainer.innerHTML = ''; 
        console.log(upiti);
        if (upiti.length === 0) {
            upitiContainer.innerHTML = '<p>Nema upita za prikaz.</p>';
            return;
        }
        upiti.forEach(upit => {
            const upitDiv = document.createElement('div');
            upitDiv.classList.add('upit');
            upitDiv.innerHTML = `
                <h3>Nekretnina ID: ${upit.NekretninaId}</h3>
                <p>Tekst upita: ${upit.tekst}</p>
            `;
            upitiContainer.appendChild(upitDiv);
        });
    }

    PoziviAjax.getMojiUpiti((error, upiti) => {
        console.log("Here");
        if (error) {
            errorMessage.textContent = `Greška pri dohvaćanju upita: ${error.statusText || error}`;
        } else {
            prikaziUpite(upiti);
        }
    });
});
