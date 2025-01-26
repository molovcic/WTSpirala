window.onload = function () {
    function updateMenuForLoginStatus(loggedIn) {
      const profilLink = document.getElementById('profilLink');
      const nekretnineLink = document.getElementById('nekretnineLink');
      const detaljiLink = document.getElementById('detaljiLink');
      const prijavaLink = document.getElementById('prijavaLink');
      const odjavaLink = document.getElementById('odjavaLink');
      const vijestiLink = document.getElementById('vijestiLink');
      const mojiUpitiLink = document.getElementById('upitiLink');
  
      if (loggedIn) {
        profilLink.style.display = 'block';
        nekretnineLink.style.display = 'block';
        detaljiLink.style.display = 'block';
        prijavaLink.style.display = 'none';
        odjavaLink.style.display = 'block';
        vijestiLink.style.display = 'block';
        mojiUpitiLink.style.display = 'block';
      } else {
        profilLink.style.display = 'none';
        nekretnineLink.style.display = 'block';
        detaljiLink.style.display = 'block';
        prijavaLink.style.display = 'block';
        odjavaLink.style.display = 'none';
        mojiUpitiLink.style.display = 'none';
        vijestiLink.style.display = 'block';
      }
    }
  
    PoziviAjax.getKorisnik(function (err, data) {
      const loggedIn = !(err || !data || !data.username);
  
      updateMenuForLoginStatus(loggedIn);
    });
  
    const odjavaLink = document.getElementById('odjavaLink');
    odjavaLink.addEventListener('click', function () {
      PoziviAjax.postLogout(function (err, data) {
        if (err != null) {
          window.alert(err);
        } else {
          window.location.href = "http://localhost:3000/prijava.html";
        }
  
        updateMenuForLoginStatus(false);
      });
    });
  };