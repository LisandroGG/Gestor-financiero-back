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
        }
        
    },{
        timestamps: false,
        defaultScope: {
            attributes: { exclude: ['contraseñaUsuario'] },
        },
        hooks: {
            beforeCreate: async (usuario) => {
                const saltRounds = 10;
                console.log('Hashing contraseña:', usuario.contraseñaUsuario);
                usuario.contraseñaUsuario = await bcrypt.hash(usuario.contraseñaUsuario, saltRounds);
            }
        }
    }
)