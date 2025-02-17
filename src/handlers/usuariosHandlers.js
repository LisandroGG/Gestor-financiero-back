import { Usuario } from "../models/usuarios.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { transporter } from "../config/mailer.js";

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
            return res.status(400).json({ message: 'La contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial.' });
        }

        const existingUser = await Usuario.findOne({ where: { nombreUsuario } });
        if (existingUser) {
            return res.status(400).json({ message: 'El nombre de usuario ya está registrado.' });
        }

        const usuario = await Usuario.findOne({ where: { gmailUsuario } });

        if(usuario) {
            return res.status(400).json({ message: 'Ese gmail ya esta registrado'})
        }

        const newUsuario = await Usuario.create({
            nombreUsuario,
            gmailUsuario,
            contraseñaUsuario,
        });

        await transporter.sendMail({
            from: 'gestorfinanciero1308@gmail.com',
            to: gmailUsuario,
            subject: `Bienvenido ${nombreUsuario} a Gestor Financiero`,
            html: `
            <b>Hola bienvenido a gestor financiero</b>
            `
        })

        return res.status(201).json(newUsuario);
        

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
        const usuario = await Usuario.findOne({ where: { gmailUsuario }, attributes: ['idUsuario', 'nombreUsuario', 'gmailUsuario', 'contraseñaUsuario'] });

        if (!usuario) {
            return res.status(404).json({ message: 'Ese gmail no esta registrado' });
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

        const secretKey = process.env.JWT_SECRET_KEY; // Puedes guardar la clave secreta en .env

        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' }); // El token expira en 1 hora

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
                nombreUsuario: usuario.nombreUsuario
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

        const secretKey = process.env.JWT_SECRET_KEY;
        const decoded = jwt.verify(token, secretKey);

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

export const actualizarContraseña = async (req, res) => {
    const { idUsuario } = req.params;
    const { nuevaContraseña } = req.body;

    if(!nuevaContraseña) {
        return res.status(400).json({ message: 'Introduzca su nueva contraseña'})
    }

    if (!regexPassword.test(nuevaContraseña)) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial.' });
    }

    try {
        const saltRounds = 10;
        const hash = await bcrypt.hash(nuevaContraseña, saltRounds);

        await Usuario.update(
            { contraseñaUsuario: hash },
            { where: { idUsuario } }
        );

        res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la contraseña" });
    }
};