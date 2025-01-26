module.exports = (sequelize, Sequelize) => {
    const Nekretnina = sequelize.define('Nekretnina', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      tip_nekretnine: {
        type: Sequelize.STRING,
        field: 'tip_nekretnine'
      },
      naziv: {
        type: Sequelize.STRING,
        field: 'naziv'
      },
      kvadratura: {
        type: Sequelize.INTEGER,
        field: 'kvadratura'
      },
      cijena: {
        type: Sequelize.INTEGER,
        field: 'cijena'
      },
      tip_grijanja: {
        type: Sequelize.STRING,
        field: 'tip_grijanja'
      },
      lokacija: {
        type: Sequelize.STRING,
        field: 'lokacija'
      },
      godina_izgradnje: {
        type: Sequelize.INTEGER,
        field: 'godina_izgradnje'
      },
      datum_objave: {
        type: Sequelize.STRING,
        field: 'datum_objave'
      },
      opis: {
        type: Sequelize.STRING,
        field: 'opis'
      },
    });
  
    Nekretnina.associate = (models) => {
      Nekretnina.hasMany(models.Upit, { as: 'upiti' });
      Nekretnina.hasMany(models.Zahtjev, { as: 'zahtjevi' });
      Nekretnina.hasMany(models.Ponuda, { as: 'ponude' });
    };
  
    Nekretnina.prototype.getInteresovanja = async function () {
      const upiti = await this.getUpiti();
      const zahtjevi = await this.getZahtjevi();
      const ponude = await this.getPonude();
  
      return [...upiti, ...zahtjevi, ...ponude];
    };
  
    return Nekretnina;
  };
  