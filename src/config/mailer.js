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
            <div style="text-align: center; color: black; background: #f1f1f1; padding: 20px;">
                <h2 >Hola ${nombreUsuario} bienvenido a gestor financiero</h2>
                <h3>Para verificar tu cuenta, haz clic en el siguiente enlace:</h3>
                <a style="text-decoration: none; color: white; background: #0ea5e9;padding: 10px; border-radius: 5px; font-size: 0.8rem; font-weight: bold" 
                href="${process.env.LOCAL}/verificar?token=${token}">Verificar cuenta</a>
                <h4>Este enlace expirará en 24 horas.</h4>
            </div>
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
            <div style="text-align: center; color: black; background: #f1f1f1; padding: 40px;">
                <h2>${usuario.nombreUsuario} haz clic en el siguiente enlace para cambiar tu contraseña: </h2>
                <a style="text-decoration: none; color: white; background: #0ea5e9;padding: 10px; border-radius: 5px; font-size: 0.8rem; font-weight: bold" 
                href="${process.env.LOCAL}/changePassword?token=${token}">Cambiar contraseña</a>
                <h4>Este enlace caducara en 15 minutos</h4>
            </div>
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
            <div style="text-align: center; color: black; background: #f1f1f1; padding: 40px;">
                <h2>${nombreUsuario} has actualizado tu contraseña</h2>
                <a style="text-decoration: none; color: white; background: #0ea5e9;padding: 10px; border-radius: 5px; font-size: 0.8rem; font-weight: bold"
                href="${process.env.LOCAL}/login">Inicia Sesion</a>
            </div>
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
            <div style="text-align: center; color: black; background: #f1f1f1; padding: 40px;">
                <h2>${nombreUsuario} has verificado tu cuenta</h2>
                <a style="text-decoration: none; color: white; background: #0ea5e9;padding: 10px; border-radius: 5px; font-size: 0.8rem; font-weight: bold"
                href="${process.env.LOCAL}/login">Inicia Sesion</a>
            </div>
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