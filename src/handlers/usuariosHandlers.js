import { Usuario } from "../models/usuarios.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { sendChangedPasswordEmail, sendForgotPasswordMail, sendVerifiedAccountEmail, sendVerifyMail } from "../config/mailer.js";

import dotenv from 'dotenv';
dotenv.config();
process.env.JWT_SECRET_KEY;

const regexEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export const registerUsuario = async (req, res) => {

    const { nombreUsuario, gmailUsuario, contraseñaUsuario } = req.body;

    try {
        if (!nombreUsuario || !gmailUsuario || !contraseñaUsuario) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        if (!regexEmail.test(gmailUsuario)) {
            return res.status(400).json({ message: 'El correo electrónico debe ser un Gmail válido.' });
        }

        if (!regexPassword.test(contraseñaUsuario)) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.' });
        }

        const usuario = await Usuario.findOne({ where: { gmailUsuario } });

        if(usuario) {
            return res.status(400).json({ message: 'Ese gmail ya esta registrado'})
        }

        const newUsuario = await Usuario.create({
            nombreUsuario,
            gmailUsuario,
            contraseñaUsuario,
            verificado: false,
        });

        const sendEmail = await sendVerifyMail(nombreUsuario, gmailUsuario)

        if(sendEmail === false){
            res.status(400).json({ message: "Error enviar el mail de verificacion"})
        }

    return res.status(200).json({ message: 'Usuario registrado. Se envió un correo de verificación.' });
        

    } catch (error) {
        console.error('Error al crear usuario:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export const loginUsuario = async (req, res) => {
    const { gmailUsuario, contraseñaUsuario } = req.body;

    try {
        // Buscar el usuario por su email
        if (!gmailUsuario) {
            return res.status(400).json({ message: 'Ingrese un gmail para poder iniciar sesion' });
        }
        const usuario = await Usuario.findOne({ where: { gmailUsuario }, attributes: ['idUsuario', 'nombreUsuario', 'gmailUsuario', 'contraseñaUsuario', 'verificado'] });

        if (!usuario) {
            return res.status(404).json({ message: 'Ese gmail no esta registrado' });
        }

        if (!usuario.verificado) {
            return res.status(400).json({ message: 'Debes verificar tu cuenta antes de iniciar sesión.' });
        }

        if(!contraseñaUsuario) {
            return res.status(400).json({ message: 'Ingrese una contraseña para iniciar sesion'})
        }
        if (!regexPassword.test(contraseñaUsuario)) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial.' });
        }
        // Comparar la contraseña ingresada con la almacenada (encriptada)
        const isPasswordValid = await bcrypt.compare(contraseñaUsuario, usuario.contraseñaUsuario);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Contraseña incorrecta.' });
        }

        const payload = {
            idUsuario: usuario.idUsuario,
            nombreUsuario: usuario.nombreUsuario,
            gmailUsuario: usuario.gmailUsuario,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' }); // El token expira en 1 hora

        return res.cookie('access_token', token, {
            httpOnly: true,
            sameSite: 'strict',
            secure: false,
            maxAge: 1000 * 60 * 60, // 1 hora
        })
        .status(200).json({
            message: 'Sesion iniciada exitosamente',
            token: {
                idUsuario: usuario.idUsuario,
                nombreUsuario: usuario.nombreUsuario,
                gmailUsuario: usuario.gmailUsuario
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export const logoutUsuario = async (req, res) => {
    try {
        res.clearCookie('access_token', {
            httpOnly: true,
            sameSite: 'strict',
            secure: false,
        });
        res.status(200).json({ message: 'Sesion cerrada exitosamente' });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ message: 'Error al intentar desconectar al usuario.' });
    }
};

export const validarSesion = async (req, res) => {
    try {
        const token = req.cookies.access_token;
        if (!token) {
            return res.status(401).json({ message: 'No hay sesión activa.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        return res.status(200).json({
            idUsuario: decoded.idUsuario,
            nombreUsuario: decoded.nombreUsuario,
            gmailUsuario: decoded.gmailUsuario,
        });
    } catch (error) {
        console.error('Error al validar sesión:', error);
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

export const enviarCorreoRecuperacion = async (req, res) => {
    const { gmailUsuario } = req.body;

    if (!regexEmail.test(gmailUsuario)) {
        return res.status(400).json({ message: 'El correo electrónico debe ser un Gmail válido.' });
    }

    try {
        const usuario = await Usuario.findOne({ where: { gmailUsuario } });
        if(!usuario) return res.status(404).json({ message: "Usuario no encontrado"})
        if(!usuario.verificado) return res.status(404).json({ message: "El usuario debe estar verificado"})

        const sentEmail = await sendForgotPasswordMail(usuario, gmailUsuario)

        if(sentEmail === false){
            return res.status(400).json({ message: "Error enviar el mail de recuperacion"})
        }

        return res.status(200).json({ message: "Correo enviado correctamente"})
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error al enviar mail de recuperacion"})
    }
}

export const cambiarContraseña = async (req, res) => {
    const { token } = req.query;
    const { nuevaContraseña } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const usuario = await Usuario.findByPk(decoded.idUsuario);
        if(!usuario) return res.status(404).json({ message: "Usuario no encontrado"})

        if(!nuevaContraseña) {
            return res.status(400).json({ message: 'Ingrese una contraseña para iniciar sesion'})
        }
        if (!regexPassword.test(nuevaContraseña)) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial.' });
        }

        const salt = await bcrypt.genSalt(10);
        usuario.contraseñaUsuario = await bcrypt.hash(nuevaContraseña, salt);

        await usuario.save()

        const sentEmail = await sendChangedPasswordEmail(usuario.nombreUsuario, usuario.gmailUsuario)

        if(sentEmail === false){
            return res.status(400).json({ message: "Error al enviar correo de contraseña cambiada"})
        }

        res.json({ message: "Contraseña actualizada correctamente"})

    } catch (error) {
        res.status(400).json({ message: "Token invalido o expirado"})
    }
}

export const verificarCuenta = async(req, res) => {
    const { token } = req.query;

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const usuario = await Usuario.findOne({ where: { gmailUsuario: decoded.gmailUsuario } });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (usuario.verificado) {
            return res.status(400).json({ message: 'El usuario ya está verificado.' });
        }

        usuario.verificado = true;
        await usuario.save();

        const sentEmail = await sendVerifiedAccountEmail(usuario.nombreUsuario, usuario.gmailUsuario)

        if(sentEmail === false){
            return res.status(400).json({ message: "Error al enviar correo de cuenta verificada"})
        }

        return res.status(200).json({ message: 'Cuenta verificada correctamente.' });


    } catch (error) {
        console.error('Error al verificar cuenta:', error);
        return res.status(400).json({ message: 'Token inválido o expirado.' });
    }
}