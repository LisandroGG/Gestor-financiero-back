import { DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';

export const Categoria = sequelize.define(
    "Categoria",
    {
        idCategoria: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombreCategoria: {
            type: DataTypes.STRING
        },
    },{
        timestamps: false
    }
)