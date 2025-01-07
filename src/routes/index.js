import { Router } from 'express';
import { usuarioRouter } from './usuariosRouter.js';

const mainRouter = Router();

mainRouter.use('/usuarios', usuarioRouter);


export default mainRouter;