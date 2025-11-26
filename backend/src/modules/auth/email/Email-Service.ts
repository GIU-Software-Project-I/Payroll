import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;


    constructor() {
        this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 587),
        secure: (process.env.SMTP_SECURE === 'true') || false,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
        logger: true,
        debug: true,
    });
        this.transporter.verify().then(() => console.log('Mail transporter verified/connected OK'))
        .catch(err => console.error('Mail transporter verify error:',err));

    }





}