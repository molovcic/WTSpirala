module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Zahtjev', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        tekst: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'tekst',
        },
        trazeniDatum: {
          type: Sequelize.DATE,
          allowNull: false,
          field: 'trazeniDatum',
        },
        odobren: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          field: 'odobren',
        },
      });
};