import { DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';

export const Gasto = sequelize.define(
    "Gasto",
    {
        idGasto: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        cantidadGasto: {
            type: DataTypes.FLOAT
        },
    },{
        timestamps: true
    }
)