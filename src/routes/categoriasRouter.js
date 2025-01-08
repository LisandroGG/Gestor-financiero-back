import { Router } from "express";
import { actualizarCategoria, crearCategoria, eliminarCategoria, obtenerCategorias } from "../handlers/categoriasHandlers.js";

export const categoriaRouter = Router();

categoriaRouter.get('/obtener/:idUsuario', obtenerCategorias);
categoriaRouter.post('/crear', crearCategoria);
categoriaRouter.put('/actualizar/:idUsuario/:idCategoria', actualizarCategoria);
categoriaRouter.delete('/eliminar/:idUsuario/:idCategoria', eliminarCategoria);