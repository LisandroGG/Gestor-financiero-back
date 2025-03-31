import { Router } from "express";
import { loginUsuario, logoutUsuario, registerUsuario, validarSesion, enviarCorreoRecuperacion, cambiarContraseña, verificarCuenta, reenviarRecuperacion } from "../handlers/usuariosHandlers.js";

export const usuarioRouter = Router();

usuarioRouter.post('/register', registerUsuario);
usuarioRouter.get('/validarSesion', validarSesion)
usuarioRouter.post('/login', loginUsuario);
usuarioRouter.post('/logout', logoutUsuario);
usuarioRouter.post('/forgotPassword', enviarCorreoRecuperacion);
usuarioRouter.put('/changePassword', cambiarContraseña);
usuarioRouter.get('/validarSesion', (req, res) => {
    res.json({ message: "Sesión válida" }); // Solo para probar si responde
});
usuarioRouter.post('/reverificar', reenviarRecuperacion)