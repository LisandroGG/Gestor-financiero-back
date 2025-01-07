import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
import pg from 'pg'

dotenv.config()

const { DB_NAME, DB_HOST, DB_PASSWORD, DB_USER } = process.env;

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'postgres',
    protocol: 'postgres',
    dialectModule: pg,
    dialectOptions: process.env.NODE_ENV === 'production' ? {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    } : {},
});



try {
    await sequelize.authenticate();
    console.log("Base de datos coonectada correctamente");
    await sequelize.sync({ alter: true }); 
} catch (error) {
    console.error("Error al conectarse con la base de datos", error);
}

export default sequelize;