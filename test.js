const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const bcrypt = require('bcrypt');

dayjs.extend(customParseFormat);

pass = "admin";
console.log(bcrypt.hashSync(pass, 10));

datum_objave = "20.12.2022";
datum = dayjs(datum_objave, 'DD.MM.YYYY');
datum2 = dayjs("22.12.2022", 'DD.MM.YYYY');

if (datum < datum2) {
    console.log("Datum je manji");
}
else{
    console.log("Datum je veci");
}