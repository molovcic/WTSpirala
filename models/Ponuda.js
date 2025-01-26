module.exports = (sequelize, Sequelize) => {
  const Ponuda = sequelize.define('Ponuda', {
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
      cijenaPonude: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: 'cijenaPonude',
      },
      datumPonude: {
          type: Sequelize.DATE,
          allowNull: false,
          field: 'datumPonude',
      },
      odbijenaPonuda: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          field: 'odbijenaPonuda',
      },
      parentPonudaId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
              model: 'Ponuda',
              key: 'id',
          },
          field: 'parentPonudaId',
      },
      vezanePonude: {
          type: Sequelize.VIRTUAL,
          get: async function () {
              // Recursive function to find root parent ID
              const findRootParentId = async (ponudaId) => {
                  const parent = await Ponuda.findByPk(ponudaId);
                  return parent && parent.parentPonudaId 
                      ? findRootParentId(parent.parentPonudaId) 
                      : ponudaId;
              };

              const rootParentId = await findRootParentId(this.id);

              return Ponuda.findAll({
                  where: {
                      [Sequelize.Op.or]: [
                          { id: rootParentId },
                          { parentPonudaId: rootParentId },
                      ],
                  },
              });
          },
      },
  });

  Ponuda.belongsTo(Ponuda, { as: 'parent', foreignKey: 'parentPonudaId' });
  Ponuda.hasMany(Ponuda, { as: 'children', foreignKey: 'parentPonudaId' });

  return Ponuda;
};
