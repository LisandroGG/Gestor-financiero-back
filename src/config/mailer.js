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
            subject: `Verificacion de cuenta ${nombreUsuario} para GastoCero`,
            html: `
                <table width="100%" cellspacing="0" cellpadding="0" style="padding: 20px;">
                    <tr>
                    <td align="center">
                        <table width="600" cellspacing="0" cellpadding="0" style="background: #f1f1f1; padding: 20px; text-align: center;">
                        <tr>
                            <td>
                            <h2>Hola ${nombreUsuario}, bienvenido a <span style="color: #0ea5e9">GastoCero</span></h2>
                            <div style="display: block; width: 100%; text-align: center;">
                            <img src="https://i.postimg.cc/yYQbXyyn/logo-1.png" alt="Logo" width="250">
                            </div>
                            <h3>Para verificar tu cuenta, haz clic en el siguiente enlace:</h3>
                            <div style="display: block; width: 100%; text-align: center;">
                                <a href="${process.env.DEPLOY}/verificar?token=${token}" 
                                style="text-decoration: none; color: white; background: #0ea5e9; padding: 10px; border-radius: 5px; font-size: 0.8rem; font-weight: bold; display: inline-block;">
                                Verificar cuenta
                                </a>
                            </div>
                            <h4>Este enlace expirará en 24 horas.</h4>
                            </td>
                        </tr>
                        </table>
                    </td>
                    </tr>
                </table>
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
                <table width="100%" cellspacing="0" cellpadding="0" style="padding: 20px;">
                    <tr>
                        <td align="center">
                            <table width="600" cellspacing="0" cellpadding="0" style="background: #f1f1f1; padding: 20px; text-align: center;">
                                <tr>
                                    <td>
                                        <h2>${usuario.nombreUsuario}, haz clic en el siguiente enlace para cambiar tu contraseña:</h2>
                                        <div style="display: block; width: 100%; text-align: center;">
                                            <img src="https://i.postimg.cc/yYQbXyyn/logo-1.png" alt="Logo" width="250" style="margin-bottom: 20px;">
                                        </div>
                                        <div style="display: block; width: 100%; text-align: center;">
                                            <a href="${process.env.DEPLOY}/changePassword?token=${token}"
                                                style="text-decoration: none; color: white; background: #0ea5e9; padding: 12px 20px; border-radius: 5px; font-size: 1rem; font-weight: bold; display: inline-block;">
                                                Cambiar contraseña
                                            </a>
                                        </div>
                                        <h4 style="margin-top: 15px;">Este enlace caducará en 15 minutos.</h4>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            `
        });

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const sendChangedPasswordEmail = async(nombreUsuario, gmailUsuario) => {
    
    try {
        await transporter.sendMail({
            from: `${MAILER_USER}`,
            to: `${gmailUsuario}`,
            subject: `${nombreUsuario} se ha actualizado tu contraseña`,
            html:`
                <table width="100%" cellspacing="0" cellpadding="0" style="padding: 20px;">
                    <tr>
                    <td align="center">
                        <table width="600" cellspacing="0" cellpadding="0" style="background: #f1f1f1; padding: 20px; text-align: center;">
                        <tr>
                            <td>
                            <h2>${nombreUsuario}, has actualizado tu contraseña</h2>
                            <div style="display: block; width: 100%; text-align: center;">
                                <img src="https://i.postimg.cc/yYQbXyyn/logo-1.png" alt="Logo" width="250" style="margin-bottom: 20px;">
                            </div>
                            <div style="display: block; width: 100%; text-align: center;">
                                <a href="${process.env.DEPLOY}/login"
                                style="text-decoration: none; margin-top: 20px; color: white; background: #0ea5e9; padding: 10px; border-radius: 5px; font-size: 0.8rem; font-weight: bold; display: inline-block;">
                                Inicia Sesión
                                </a>
                            </div>
                            </td>
                        </tr>
                        </table>
                    </td>
                    </tr>
                </table>
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
                <table width="100%" cellspacing="0" cellpadding="0" style="padding: 20px;">
                    <tr>
                    <td align="center">
                        <table width="600" cellspacing="0" cellpadding="0" style="background: #f1f1f1; padding: 20px; text-align: center;">
                        <tr>
                            <td>
                            <h2>${nombreUsuario}, has verificado tu cuenta</h2>
                            <div style="display: block; width: 100%; text-align: center;">
                                <img src="https://i.postimg.cc/yYQbXyyn/logo-1.png" alt="Logo" width="250">
                            </div>
                            <div style="display: block; width: 100%; text-align: center;">
                                <a href="${process.env.DEPLOY}/login"
                                style="text-decoration: none; margin-top: 20px; color: white; background: #0ea5e9; padding: 10px; border-radius: 5px; font-size: 0.8rem; font-weight: bold; display: inline-block;">
                                Inicia Sesión
                                </a>
                            </div>
                            </td>
                        </tr>
                        </table>
                    </td>
                    </tr>
                </table>
            `
        })

        return true
    } catch (error) {
        return false
    }
}