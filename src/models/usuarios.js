import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from '../database/database.js';

export const Usuario = sequelize.define(
    "Usuario",
    {
        idUsuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombreUsuario: {
            type: DataTypes.STRING
        },
        contraseñaUsuario: {
            type: DataTypes.STRING
        },
        gmailUsuario: {
            type: DataTypes.STRING
        },
        verificado: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
        
    },{
        timestamps: false,
        defaultScope: {
            attributes: { exclude: ['contraseñaUsuario'] },
        },
        hooks: {
            beforeCreate: async (usuario) => {
                const saltRounds = 10;
                usuario.contraseñaUsuario = await bcrypt.hash(usuario.contraseñaUsuario, saltRounds);
            }
        }
    }
)