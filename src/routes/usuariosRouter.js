import { Router } from "express";
import { loginUsuario, logoutUsuario, registerUsuario } from "../handlers/usuariosHandlers.js";

export const usuarioRouter = Router();

usuarioRouter.post('/register', registerUsuario);
usuarioRouter.post('/login', loginUsuario);
usuarioRouter.post('/logout', logoutUsuario);