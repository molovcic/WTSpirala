module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Upit', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        }, 
        tekst: {
            type: Sequelize.STRING,
            field: 'tekst', 
            allowNull: false
        }
    });
};