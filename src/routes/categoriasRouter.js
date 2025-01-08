import { Router } from "express";
import { crearCategoria } from "../handlers/categoriasHandlers.js";

export const categoriaRouter = Router();

categoriaRouter.get('/obtener', )
categoriaRouter.post('/crear', crearCategoria);
categoriaRouter.put('/editar', );
categoriaRouter.delete('/borrar', );