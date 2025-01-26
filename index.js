const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs").promises; // Using asynchronus API for file read and write
const bcrypt = require("bcrypt");
const {
  sequelize,
  Korisnik,
  Nekretnina,
  Upit,
  Zahtjev,
  Ponuda,
} = require("./models");

// Importovanje dayjs za lakse uporedjivanje 'DD.MM.YYYY' datuma
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const { Console } = require("console");
dayjs.extend(customParseFormat);

const app = express();
const PORT = 3000;

app.use(
  session({
    secret: "tajna sifra",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(express.static(__dirname + "/public"));

// Enable JSON parsing without body-parser
app.use(express.json());

/* ---------------- SERVING HTML -------------------- */

// Async function for serving html files
async function serveHTMLFile(req, res, fileName) {
  const htmlPath = path.join(__dirname, "public/html", fileName);
  try {
    const content = await fs.readFile(htmlPath, "utf-8");
    res.send(content);
  } catch (error) {
    console.error("Error serving HTML file:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
}

// Array of HTML files and their routes
const routes = [
  { route: "/nekretnine.html", file: "nekretnine.html" },
  { route: "/detalji.html", file: "detalji.html" },
  { route: "/meni.html", file: "meni.html" },
  { route: "/prijava.html", file: "prijava.html" },
  { route: "/profil.html", file: "profil.html" },
  { route: "/vijesti.html", file: "vijesti.html" },
  { route: "/statistika.html", file: "statistika.html" },
  { route: "/mojiUpiti.html", file: "mojiUpiti.html" },
  { route: "/top5.html", file: "top5.html" },
  // Practical for adding more .html files as the project grows
];

// Loop through the array so HTML can be served
routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});

/* ----------- SERVING OTHER ROUTES --------------- */

// Async function for reading json data from data folder
async function readJsonFile(filename) {
  const filePath = path.join(__dirname, "data", `${filename}.json`);
  try {
    const rawdata = await fs.readFile(filePath, "utf-8");
    return JSON.parse(rawdata);
  } catch (error) {
    throw error;
  }
}

// Async function for reading json data from data folder
async function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, "data", `${filename}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    throw error;
  }
}

/*
Checks if the user exists and if the password is correct based on korisnici.json data. 
If the data is correct, the username is saved in the session and a success message is sent.
*/
const loginAttempts = {};

app.post("/login", async (req, res) => {
  const jsonObj = req.body;
  const username = jsonObj.username;
  const timestamp = new Date().toISOString();
  const logFilePath = path.join(__dirname, "prijave.txt");

  if (!loginAttempts[username]) {
    loginAttempts[username] = { count: 0, lastAttempt: null };
  }

  try {
    const userAttempts = loginAttempts[username];
    const currentTime = Date.now();
    if (
      userAttempts.lastAttempt &&
      currentTime - userAttempts.lastAttempt < 60000 &&
      userAttempts.count >= 3
    ) {
      await fs.appendFile(
        logFilePath,
        `[${timestamp}] - username: "${username}" - status: "neuspješno (blokiran)"\n`
      );
      return res.status(429).json({
        greska: "Previse neuspjesnih pokusaja. Pokusajte ponovo za 1 minutu.",
      });
    }

    // Read users from file
    const korisnici = await Korisnik.findAll();
    let found = false;

    for (const korisnik of korisnici) {
      if (korisnik.username === username) {
        const isPasswordMatched = await bcrypt.compare(
          jsonObj.password,
          korisnik.password
        );

        if (isPasswordMatched) {
          req.session.user = korisnik;
          found = true;
          userAttempts.count = 0;
          break;
        }
      }
    }

    if (found) {
      await fs.appendFile(
        logFilePath,
        `[${timestamp}] - username: "${username}" - status: "uspješno"\n`
      );
      return res.json({ poruka: "Uspješna prijava" });
    } else {
      userAttempts.count += 1;
      userAttempts.lastAttempt = currentTime;
      await fs.appendFile(
        logFilePath,
        `[${timestamp}] - username: "${username}" - status: "neuspješno"\n`
      );
      return res.json({ poruka: "Neuspješna prijava" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

/*
Delete everything from the session.
*/
app.post("/logout", (req, res) => {
  // Check if the user is authenticated
  if (!req.session.user) {
    // User is not logged in
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  // Clear all information from the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      res.status(500).json({ greska: "Internal Server Error" });
    } else {
      res.status(200).json({ poruka: "Uspješno ste se odjavili" });
    }
  });
});

/*
Returns currently logged user data. First takes the username from the session and grabs other data
from the .json file.
*/
app.get("/korisnik", async (req, res) => {
  // Check if the username is present in the session
  if (!req.session.user) {
    // User is not logged in
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  // User is logged in, fetch additional user data
  const username = req.session.user.username;

  try {
    // Read user data from the JSON file
    const user = await Korisnik.findByPk(req.session.user.id);

    if (!user) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: "Neautorizovan pristup" });
    }

    // Send user data
    const userData = {
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      username: user.username,
      password: user.password, // Should exclude the password for security reasons
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

/*
Allows logged user to make a request for a property
*/

app.post("/upit", async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.user) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  const { nekretnina_id, tekst_upita } = req.body;

  try {
    const korisnik = await Korisnik.findByPk(req.session.user.id);
    if (!korisnik) {
      return res.status(401).json({ greska: "Neautorizovan pristup" });
    }

    // Check if the property exists
    const nekretnina = await Nekretnina.findByPk(nekretnina_id);
    if (!nekretnina) {
      return res
        .status(400)
        .json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
    }

    // Count the number of inquiries for the specific property by this user
    const brojUpita = await Upit.count({
      where: {
        NekretninaId: nekretnina_id,
        KorisnikId: korisnik.id,
      },
    });

    // If the user has exceeded the limit of 3 inquiries, return an error response
    if (brojUpita >= 3) {
      return res
        .status(429)
        .json({ greska: "Previse upita za istu nekretninu." });
    }

    // Create a new inquiry
    await Upit.create({
      NekretninaId: nekretnina_id,
      KorisnikId: korisnik.id,
      tekst: tekst_upita,
    });

    // Respond with success
    return res.status(200).json({ poruka: "Upit je uspješno dodan" });
  } catch (error) {
    console.error("Error processing query:", error);
    return res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/upiti/moji", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ greska: "Neaturorizovan pristup" });
  }

  try {
    user = await Korisnik.findByPk(req.session.user.id);

    if (!user) {
      return res.status(401).json({ greska: "Neautorizovan pristup" });
    }

    upiti = await Upit.findAll({
      where: {
        KorisnikId: user.id,
      },
    });

    if (upiti.length === 0) {
      return res.status(404).json({ greska: "Nema upita" });
    }
    res.status(200).json(upiti);
  } catch (error) {
    console.error("Error fetching queries:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

/*
Updates any user field
*/
app.put("/korisnik", async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.user) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  // Get data from the request body
  const { ime, prezime, username, password } = req.body;

  try {
    // Fetch the logged-in user from the database
    const user = await Korisnik.findByPk(req.session.user.id);

    if (!user) {
      return res.status(404).json({ greska: "Korisnik nije pronađen" });
    }

    // Update user data with the provided values
    if (ime) user.ime = ime;
    if (prezime) user.prezime = prezime;
    if (username) user.username = username;
    if (password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Save the updated user data to the database
    await user.save();

    res.status(200).json({ poruka: "Podaci su uspješno ažurirani" });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

/*
Returns all properties from the file.
*/
app.get("/nekretnine", async (req, res) => {
  try {
    nekretnine = await Nekretnina.findAll();
    res.json(nekretnine);
  } catch (error) {
    console.error("Error fetching properties data:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/nekretnine/top5", async (req, res) => {
  try {
    const { lokacija } = req.query;

    if (!lokacija) {
      return res
        .status(400)
        .json({ error: "Lokacija mora biti specificirana." });
    }

    nekretnine = await Nekretnina.findAll({
      where: {
        lokacija: lokacija,
      },
    });

    const filtriraneNekretnine = nekretnine
      .filter((nekretnina) => nekretnina.lokacija === lokacija)
      .sort(
        (a, b) =>
          dayjs(b.datum_objave, "DD.MM.YYYY") -
          dayjs(a.datum_objave, "DD.MM.YYYY")
      )
      .slice(0, 5);

    res.status(200).json(filtriraneNekretnine);
  } catch (error) {
    console.error("Greška prilikom dohvata podataka o nekretninama:", error);
    res.status(500).json({ error: "Došlo je do greške na serveru." });
  }
});

app.get("/nekretnina/:id", async (req, res) => {
  try {
    const { id } = req.params;

    nekretnina = await Nekretnina.findByPk(id);

    if (!nekretnina) {
      return res.status(404).json({ error: "Nekretnina nije pronađena." });
    }

    upiti = await Upit.findAll({
      where: {
        NekretninaId: id,
      },
    });

    upiti = upiti.slice(upiti.length - 3, upiti.length);

    res.status(200).json({ nekretnina, upiti });
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/next/upiti/nekretnina:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { page } = req.query;

    nekretnina = await Nekretnina.findByPk(id);
    if (!nekretnina) {
      return res.status(404).json({ error: "Nekretnina nije pronađena." });
    }

    const pageNumber = parseInt(page, 10);
    if (isNaN(pageNumber) || pageNumber < 1) {
      return res
        .status(400)
        .json({ error: 'Parametar "page" mora biti cijeli broj >= 1' });
    }

    upiti = await Upit.findAll({
      where: {
        NekretninaId: id,
      },
    });

    const itemsPerPage = 3;
    const startIndex = pageNumber * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Reverse the upiti array
    const reversedUpiti = upiti.slice().reverse();

    // Get the paginated results from the reversed array
    const paginatedUpiti = reversedUpiti.slice(startIndex, endIndex);

    if (paginatedUpiti.length === 0) {
      return res.status(404).json([]);
    }

    res.status(200).json(paginatedUpiti);
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/nekretnina/:id/interesovanja", async (req, res) => {
  const id = req.params.id;
  
  let isAdmin = null;
  if(req.session.user) {
    isAdmin = req.session.user.administrator ? 1 : null;
  }

  try {
    nekretnina = await Nekretnina.findByPk(id, {
      include: [
        { model: Upit, as: "upiti" },
        { model: Zahtjev, as: "zahtjevi" },
        { model: Ponuda, as: "ponude" },
      ],
    });

    if (!nekretnina) {
      return res.status(404).json({ error: "Nekretnina nije pronađena." });
    }

    const ponude = nekretnina.ponude.map((ponuda) => {
      if (
        isAdmin || 
        ponuda.korisnikId === req.session.user.id || 
        ponuda.vezanePonude.some((vp) => vp.korisnikId === req.session.user.id) 
      ) {
        return ponuda; 
      } else {
        const { cijenaPonude, ...ponudaBezCijene } = ponuda.toJSON();
        return ponudaBezCijene; 
      }
    });

    const interesovanja = {
      upiti: nekretnina.upiti,
      zahtjevi: nekretnina.zahtjevi,
      ponude,
    };

    res.json(interesovanja);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška na serveru" });
  }
});

app.post("/nekretnina/:id/ponuda", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  try {
    const { id } = req.params;

    const { tekst, ponudaCijene, datumPonude, idVezanePonude, odbijenaPonuda } =
      req.body;

    if (idVezanePonude != null) {
      const ponuda = await Ponuda.findByPk(idVezanePonude);
      if (!ponuda) {
        return res.status(404).json({ greska: "Ponuda nije pronađena" });
      }
      if (ponuda.odbijenaPonuda) {
        return res
          .status(400)
          .json({ greska: "Vezana ponuda je vec odbijena" });
      }

      if (req.session.user.administrator == 0) {
        if (ponuda.idKorisnika !== req.session.user.id) {
          return res.status(403).json({ greska: "Nemate pravo vezanja na tu ponudu" });
        }
      }
    }

    await Ponuda.create({
      tekst: tekst,
      cijenaPonude: ponudaCijene,
      datumPonude: datumPonude,
      odbijenaPonuda: odbijenaPonuda,
      vezanaPonudaId: idVezanePonude,
      KorisnikId: req.session.user.id,
      NekretninaId: id,
    });

    res.status(200).json({ poruka: "Ponuda je uspješno dodana" });
  } catch {
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.post("/nekretnina/:id/zahtjev", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  const id = req.params.id;
  const { tekst, trazeniDatum } = req.body;

  try {
    nekretnina = await Nekretnina.findByPk(id);

    if (!nekretnina) {
      return res.status(404).json({ greska: "Trazena nekretnina ne postoji" });
    }

    const parsedDate = dayjs(trazeniDatum, "DD.MM.YYYY");

    if (!parsedDate.isValid()) {
      return res.status(400).json({ greska: "Neispravan format datuma" });
    }

    const currentDate = dayjs();

    if (parsedDate.isBefore(currentDate, 'day')) {
      return res.status(400).json({ greska: "Trazeni datum je prije trenutnog datuma" });
    }


    await Zahtjev.create({
      tekst: tekst,
      trazeniDatum: parsedDate.toDate(),  
      KorisnikId: req.session.user.id,
      NekretninaId: id,
    });

    res.status(200).json({ poruka: "Zahtjev je uspješno dodan" });

  } catch (error) {
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.put("/nekretnina/:id/zahtjev/:zid", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  if (req.session.user.administrator == false) {
    return res.status(403).json({ greska: "Nemate pravo pristupa" });
  }

  const { id, zid } = req.params;

  const { odobren, addToTekst } = req.body;

  try{
    nekretnina = await Nekretnina.findByPk(id);

    if (!nekretnina) {
      return res.status(404).json({ greska: "Trazena nekretnina ne postoji" });
    }
    
    zahtjev = await Zahtjev.findByPk(zid);

    if (!zahtjev) {
      return res.status(404).json({ greska: "Trazeni zahtjev ne postoji" });
    }

    if (zahtjev.NekretninaId !== nekretnina.id) {
      return res.status(400).json({ greska: "Zahtjev ne odgovara nekretnini" });
    }

    if (zahtjev.odobren) {
      return res.status(400).json({ greska: "Zahtjev je vec odobren" });
    }

    tekst = zahtjev.tekst;

    tekst = tekst + "  ODGOVOR ADMINA: " + addToTekst;

    zahtjev.odobren = odobren;
    zahtjev.tekst = tekst;


    await zahtjev.save();

    res.status(200).json({ poruka: "Zahtjev je uspješno ažuriran" });
  }
  catch (error) {
    return res.status(500).json({ greska: "Internal Server Error" });
  }
});

/* ----------------- MARKETING ROUTES ----------------- */

// Route that increments value of pretrage for one based on list of ids in nizNekretnina
app.post("/marketing/nekretnine", async (req, res) => {
  const { nizNekretnina } = req.body;

  try {
    // Load JSON data
    let preferencije = await readJsonFile("preferencije");

    // Check format
    if (!preferencije || !Array.isArray(preferencije)) {
      console.error("Neispravan format podataka u preferencije.json.");
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    // Init object for search
    preferencije = preferencije.map((nekretnina) => {
      nekretnina.pretrage = nekretnina.pretrage || 0;
      return nekretnina;
    });

    // Update atribute pretraga
    nizNekretnina.forEach((id) => {
      const nekretnina = preferencije.find((item) => item.id === id);
      if (nekretnina) {
        nekretnina.pretrage += 1;
      }
    });

    // Save JSON file
    await saveJsonFile("preferencije", preferencije);

    res.status(200).json({});
  } catch (error) {
    console.error("Greška prilikom čitanja ili pisanja JSON datoteke:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/marketing/nekretnina/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Read JSON
    const preferencije = await readJsonFile("preferencije");

    // Finding the needed objects based on id
    const nekretninaData = preferencije.find(
      (item) => item.id === parseInt(id, 10)
    );

    if (nekretninaData) {
      // Update clicks
      nekretninaData.klikovi = (nekretninaData.klikovi || 0) + 1;

      // Save JSON file
      await saveJsonFile("preferencije", preferencije);

      res
        .status(200)
        .json({ success: true, message: "Broj klikova ažuriran." });
    } else {
      res.status(404).json({ error: "Nekretnina nije pronađena." });
    }
  } catch (error) {
    console.error("Greška prilikom čitanja ili pisanja JSON datoteke:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/marketing/osvjezi/pretrage", async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON
    const preferencije = await readJsonFile("preferencije");

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, pretrage: nekretninaData ? nekretninaData.pretrage : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error("Greška prilikom čitanja ili pisanja JSON datoteke:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/marketing/osvjezi/klikovi", async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON
    const preferencije = await readJsonFile("preferencije");

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, klikovi: nekretninaData ? nekretninaData.klikovi : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error("Greška prilikom čitanja ili pisanja JSON datoteke:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database sync successful");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
