import { Router } from "express";
import { crearGasto, obtenerGastos, actualizarGasto, eliminarGasto } from '../handlers/gastosHandlers.js'

export const gastoRouter = Router();

gastoRouter.get('/obtener/:idUsuario', obtenerGastos);
gastoRouter.post('/crear', crearGasto);
gastoRouter.put('/actualizar/:idUsuario/idCategoria/:idCategoria/idGasto/:idGasto', actualizarGasto);
gastoRouter.delete('/eliminar/:idUsuario/:idGasto', eliminarGasto)