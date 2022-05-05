import {Service} from "typedi";
import nodemailer from "nodemailer";

@Service()
export default class MailSender {
    readonly mailSender = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAIL_USER as string,
            pass: process.env.MAIL_PASSWORD as string
        }
    });

    public sendCreatedAccountEmail = (email: string, rawPassword: string) => {
        const subject = "Login with Google";
        const text = "We have created a account for you based on your google public info \r\n"
            + "Please use this account to login and changed your password:\r\n"
            + `- Email: ${email}\r\n`
            + `- Password: ${rawPassword}`;

        this.sendEmail(email, subject, text);
    };

    public sendActivationLink = (email: string, activationLink: string) => {
        const subject = "Registration Confirmation";
        const text = "Please follow this link to verify your account!\r\n" +
            activationLink;

        this.sendEmail(email, subject, text);
    };

    private sendEmail = (to: string, subject: string, text: string) => {
        let emailOptions = {
            from: "Lang Thang Project",
            to: to,
            subject: subject,
            text: text
        }

        if (process.env.NODE_ENV == "production") {
            this.mailSender.sendMail(emailOptions, ((err, info) => {
                if (err)
                    console.error(err);
            }));
        }
    };

    public verify = () => {
        this.mailSender.verify((err, success) => {
            if (err)
                console.error(err)
            else console.log("Ready to use");
        });
    }

    sendResetPwdLink(email: string, resetPwdLink: string) {
        const subject = "Reset Password";
        const text = "Please follow this link to reset your password!\r\n" +
            resetPwdLink;

        this.sendEmail(email, subject, text);
    }
}
