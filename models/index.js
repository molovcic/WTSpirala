const Sequelize = require('sequelize');

const sequelize = new Sequelize('wt24', 'root', 'password', {
  host: '127.0.0.1',
  dialect: 'mysql',
  define:{
    freezeTableName: true,
    timestamps: false,
  }
});
  
const Korisnik = require('./korisnik')(sequelize, Sequelize);
const Nekretnina = require('./nekretnina')(sequelize, Sequelize);
const Upit = require('./upit')(sequelize, Sequelize);
const Zahtjev = require('./zahtjev')(sequelize, Sequelize);
const Ponuda = require('./ponuda')(sequelize, Sequelize);


Korisnik.hasMany(Upit, { as: 'upiti' });
Korisnik.hasMany(Zahtjev, { as: 'zahtjevi' });
Korisnik.hasMany(Ponuda, { as: 'ponude' });

Nekretnina.hasMany(Upit, { as: 'upiti' });
Nekretnina.hasMany(Zahtjev, { as: 'zahtjevi' });
Nekretnina.hasMany(Ponuda, { as: 'ponude' });



Upit.belongsTo(Korisnik);
Zahtjev.belongsTo(Korisnik);
Ponuda.belongsTo(Korisnik);

Upit.belongsTo(Nekretnina);
Zahtjev.belongsTo(Nekretnina);
Ponuda.belongsTo(Nekretnina);

module.exports = { sequelize, Korisnik, Nekretnina, Upit, Zahtjev, Ponuda };
  


