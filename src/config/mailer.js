import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config()

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

transporter.verify().then(() => {
    console.log('Ready for send gmail')
})