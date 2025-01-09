import { Router } from 'express';
import { usuarioRouter } from './usuariosRouter.js';
import { categoriaRouter } from './categoriasRouter.js';
import { gastoRouter } from './gastosRouter.js';

const mainRouter = Router();

mainRouter.use('/usuarios', usuarioRouter);
mainRouter.use('/categorias', categoriaRouter);
mainRouter.use('/gastos', gastoRouter);


export default mainRouter;