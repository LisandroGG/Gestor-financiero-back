import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './src/database/database.js';
import { Usuario } from './src/models/usuarios.js';
import { Categoria } from './src/models/categorias.js';
import { Gasto } from './src/models/gastos.js';
import mainRouter from './src/routes/index.js';
import cookieParser from "cookie-parser";

dotenv.config();

const app = express()
const port = process.env.PORT;
const localhost = process.env.LOCAL

app.use(cookieParser())

app.use(cors({
    origin: "https://gastocero.vercel.app",
    credentials: true,
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization"]
}));

//PARA DESARROLLO
// app.use(cors({
//     origin: localhost,
//     credentials: true 
// }));

app.use(express.json())

app.use("/", mainRouter)


async function main() {
    try {
        await sequelize.sync({ force: false });

        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    } catch (error) {
        console.error("Connection failed:", error.message);
    }
}

// Relación Usuario - Categoría
Usuario.hasMany(Categoria, { foreignKey: 'idUsuario', as: 'categorias' });
Categoria.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'usuario' });

// Relación Usuario - Gasto
Usuario.hasMany(Gasto, { foreignKey: 'idUsuario', as: 'gastos' });
Gasto.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'usuario' });

// Relación Categoría - Gasto
Categoria.hasMany(Gasto, { foreignKey: 'idCategoria', as: 'gastos' });
Gasto.belongsTo(Categoria, { foreignKey: 'idCategoria', as: 'categoria' });

main()

export default app;

