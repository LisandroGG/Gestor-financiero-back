import { Router } from "express";
import { loginUsuario, logoutUsuario, registerUsuario, validarSesion, actualizarContraseña } from "../handlers/usuariosHandlers.js";

export const usuarioRouter = Router();

usuarioRouter.post('/register', registerUsuario);
usuarioRouter.get('/validarSesion', validarSesion)
usuarioRouter.post('/login', loginUsuario);
usuarioRouter.post('/logout', logoutUsuario);
usuarioRouter.put('/change-password/:idUsuario', actualizarContraseña)