import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'

dotenv.config()
process.env.JWT_SECRET_KEY;

const {MAILER_USER, MAILER_HOST, MAILER_PORT, MAILER_PASSWORD} = process.env;

export const transporter = nodemailer.createTransport({
    host: `${MAILER_HOST}`,
    port: `${MAILER_PORT}`,
    secure: "true",
    auth: {
        user: `${MAILER_USER}`,
        pass: `${MAILER_PASSWORD}`
    },
});

export const sendVerifyMail = async( nombreUsuario, gmailUsuario ) => {

    const token = jwt.sign({ gmailUsuario }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

    try {
        await transporter.sendMail({
            from: `${MAILER_USER}`,
            to: gmailUsuario,
            subject: `Verificacion de cuenta ${nombreUsuario} para Gestor Financiero`,
            html: `
            <b>Hola bienvenido a gestor financiero</b>
            <p>Para verificar tu cuenta, haz clic en el siguiente enlace:</p>
            <a href="${process.env.LOCAL}/verificar?token=${token}">Verificar cuenta</a>
            <p>Este enlace expirará en 24 horas.</p>
            `
        })

        return true
    } catch (error) {
        return false
    }
}

export const sendForgotPasswordMail = async(usuario, gmailUsuario) => {
    const token = jwt.sign({ idUsuario: usuario.idUsuario}, process.env.JWT_SECRET_KEY, { expiresIn: '15m' })

    try {
        await transporter.sendMail({
            from: `${MAILER_USER}`,
            to: `${gmailUsuario}`,
            subject: 'Cambiar contraseña',
            html:`
            <p>Haz clic en el siguiente enlace para cambiar tu contraseña: </p>
            <a href="${process.env.LOCAL}/changePassword?token=${token}">Cambiar contraseña</a>
            <p>Este enlace caducara en 15 minutos</p>
            `
        })

        return true
    } catch (error) {
        return false
    }
}

export const sendChangedPasswordEmail = async(nombreUsuario, gmailUsuario) => {
    
    try {
        await transporter.sendMail({
            from: `${MAILER_USER}`,
            to: `${gmailUsuario}`,
            subject: `${nombreUsuario} se ha actualizado tu contraseña`,
            html:`
            <p>Haz actualizado tu contraseña</p>
            <a href="${process.env.LOCAL}/login">Inicia Sesion</a>
            `
        })

        return true
    } catch (error) {
        return false
    }
}

export const sendVerifiedAccountEmail = async(nombreUsuario, gmailUsuario) => {
    
    try {
        await transporter.sendMail({
            from: `${MAILER_USER}`,
            to: `${gmailUsuario}`,
            subject: `${nombreUsuario} se ha verificado tu cuenta`,
            html:`
            <b>Has verificado tu cuenta</b>
            <a href="${process.env.LOCAL}/login">Inicia Sesion</a>
            `
        })

        return true
    } catch (error) {
        return false
    }
}

transporter.verify().then(() => {
    console.log('Ready for send gmail')
})