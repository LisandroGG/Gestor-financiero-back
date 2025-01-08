import { Router } from 'express';
import { usuarioRouter } from './usuariosRouter.js';
import { categoriaRouter } from './categoriasRouter.js';

const mainRouter = Router();

mainRouter.use('/usuarios', usuarioRouter);
mainRouter.use('/categorias', categoriaRouter)


export default mainRouter;