'use strict';
const bcrypt = require('bcryptjs');
const { password } = require('pg/lib/defaults');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  // class User extends Model {
  //   /**
  //    * Helper method for defining associations.
  //    * This method is not a part of Sequelize lifecycle.
  //    * The `models/index` file will call this method automatically.
  //    */
  //   static associate(models) {
  //     // define association here
  //   }
  // }

  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  },
  {
    defaultScope: {
      rawAttributes: { exclude: [password ]}
    }
  });

  User.beforCreate(async (user) => {
    user.password = await user.generatePasswordHash()
  });

  User.prototype.generatePasswordHash = function () {
    if (this.password) {
      return bcrypt.hash(this.password, 10)
    }
  }

  User.associate = function (models) {
    User.hasMany(models.Post, { foreignKey: 'userId', as: 'posts' })
  }

  // User.init({
  //   name: DataTypes.STRING,
  //   email: DataTypes.STRING,
  //   password: DataTypes.STRING
  // }, {
  //   sequelize,
  //   modelName: 'User',
  // });
  return User;
};