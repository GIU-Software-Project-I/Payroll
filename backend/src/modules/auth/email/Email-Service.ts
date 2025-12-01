<<<<<<< HEAD
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: any;
    private readonly logger = new Logger(MailService.name);

    constructor() {
        const host = process.env.SMTP_HOST || 'smtp.gmail.com';
        const port = Number(process.env.SMTP_PORT || 587);
        const secure = (process.env.SMTP_SECURE === 'true') || port === 465;

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
            logger: process.env.SMTP_DEBUG === 'true',
            debug: process.env.SMTP_DEBUG === 'true',
            // reduce long hanging network waits during startup
            connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 5000),
            greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 5000),
            socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 5000),
        });

        const shouldVerify = process.env.SMTP_VERIFY !== 'false' && process.env.NODE_ENV === 'production';
        if (shouldVerify) {
            this.transporter
                .verify()
                .then(() => this.logger.log('Mail transporter verified/connected OK'))
                .catch((err: any) => this.logger.error('Mail transporter verify error:', err));
        } else {
            this.logger.log('Mail transporter verification skipped (SMTP_VERIFY=false or non-production)');
        }
    }
}
=======
// import { Injectable } from '@nestjs/common';
// import * as nodemailer from 'nodemailer';
//
// @Injectable()
// export class MailService {
//     private transporter;
//
//
//     constructor() {
//         this.transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST || 'smtp.gmail.com',
//         port: Number(process.env.SMTP_PORT || 587),
//         secure: (process.env.SMTP_SECURE === 'true') || false,
//         auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
//         logger: true,
//         debug: true,
//     });
//         this.transporter.verify().then(() => console.log('Mail transporter verified/connected OK'))
//         .catch(err => console.error('Mail transporter verify error:',err));
//
//     }
//
//
//
//
//
// }
>>>>>>> 7104891f826172d6e14a292132b878849990ef1b
