module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Korisnik', {
        id : {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        ime : {
            type: Sequelize.STRING,
            field: 'ime'
        },
        prezime : {
            type: Sequelize.STRING,
            field: 'prezime'
        },
        username : {
            type: Sequelize.STRING,
            field: 'username'
        },
        password : {
            type: Sequelize.STRING,
            field: 'password'
        },
        administrator : {
            type: Sequelize.BOOLEAN,
            field: 'administrator'
        }
    });
};