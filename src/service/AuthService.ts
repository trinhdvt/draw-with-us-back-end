import {Service} from "typedi";
import AccountRepository from "../repository/AccountRepository";
import JwtService from "./JwtService";
import {StatusCodes} from "http-status-codes";
import Account from "../models/Account";
import MailSender from "../utils/MailSender";
import StringUtils from "../utils/StringUtils";
import RegisterDto from "../dto/RegisterDto";
import {randomUUID} from "crypto";
import bcrypt from "bcrypt";
import PasswordResetToken from "../models/PasswordResetToken";
import Role from "../models/Role";
import {HttpError, NotFoundError, UnauthorizedError} from "routing-controllers";

@Service()
export default class AuthService {
    constructor(
        private accountRepository: AccountRepository,
        private jwtService: JwtService,
        private mailSender: MailSender
    ) {}

    public login = async (email: string, password: string) => {
        const acc = await this.accountRepository.findByEmail(email);
        if (!acc) {
            throw new NotFoundError(`Email ${email} not found`);
        }

        const isPasswordCorrect = await this.checkPassword(
            password,
            acc.password
        );
        if (!isPasswordCorrect) {
            throw new UnauthorizedError("Invalid password");
        }

        const {accessToken, refreshToken} = await this.jwtService.createToken(
            acc
        );
        return {accessToken, refreshToken};
    };

    public loginWithGoogle = async (googleToken: string) => {
        return {
            accessToken: "",
            refreshToken: ""
        };
    };

    public reCreateToken = async (
        accessToken: string,
        refreshToken: string
    ) => {
        let isValid = await this.jwtService.isValidToRefreshToken(
            accessToken,
            refreshToken
        );
        if (!isValid) {
            throw new UnauthorizedError("Not eligible to refresh token");
        }

        const {email} = this.jwtService.getPayLoad(accessToken);
        const acc = await this.accountRepository.findByEmail(email);
        if (!acc) {
            throw new UnauthorizedError("Email not exist");
        }

        return await this.jwtService.createToken(acc);
    };

    public register = async (userData: RegisterDto) => {
        const {email, name, password} = userData;

        const acc = await this.accountRepository.findByEmail(email);
        if (!acc) {
            // email not existing

            // create a random register token
            const registerToken = randomUUID({disableEntropyCache: true});

            // encrypt password
            const encryptedPassword = await this.encryptPassword(password);

            // create and save to db
            await Account.create({
                email: email,
                name: name,
                password: encryptedPassword,
                role: Role.ROLE_USER,
                enabled: false,
                registerToken: registerToken
            });

            // send activation link
            const activationLink = `${process.env.DOMAIN}/auth/active/${registerToken}`;
            this.mailSender.sendActivationLink(email, activationLink);
        } else if (acc.enabled) {
            // email is already in-use
            throw new HttpError(
                StatusCodes.CONFLICT,
                "Email is already existed"
            );
        } else {
            // re-send activation link
            const registerToken = acc.registerToken;
            const activationLink = `${process.env.DOMAIN}/auth/active/${registerToken}`;
            this.mailSender.sendActivationLink(email, activationLink);

            // send back an error as warning
            throw new HttpError(
                StatusCodes.LOCKED,
                "Please check your email to verify your account!"
            );
        }
    };

    public encryptPassword = async (password: string) => {
        return await bcrypt.hash(password, 10);
    };

    public checkPassword = async (
        rawPassword: string,
        encryptedPassword: string
    ) => {
        return await bcrypt.compare(rawPassword, encryptedPassword);
    };

    public activateAccount = async (registerToken: string) => {
        const account = await this.accountRepository.findByRegisterToken(
            registerToken
        );
        if (!account) {
            throw new UnauthorizedError("Invalid register token");
        }

        account.enabled = true;
        account.registerToken = null;
        await account.save();
    };

    public createPwdResetToken = async (email: string) => {
        const acc = await this.accountRepository.findByEmail(email);
        if (!acc) {
            throw new NotFoundError("Email not found");
        }
        if (!acc.enabled) {
            throw new HttpError(StatusCodes.LOCKED, "Email is not verified");
        }

        let pwdResetToken = await PasswordResetToken.findOne({
            where: {
                accountId: acc.id
            }
        });
        //
        const token = StringUtils.randomUUID();
        const expiredDate = new Date(Date.now() + 60000 * 30);

        //
        if (!pwdResetToken) {
            //
            pwdResetToken = PasswordResetToken.build({
                token: token,
                expireDate: expiredDate,
                accountId: acc.id
            });
        } else {
            //
            pwdResetToken.expireDate = expiredDate;
        }
        pwdResetToken = await pwdResetToken.save();

        //
        let restPwdLink = `http://localhost:8080/auth/resetPassword/${pwdResetToken.token}`;
        this.mailSender.sendResetPwdLink(acc.email, restPwdLink);
    };

    public validatePwdResetToken = async (token: string) => {
        const rfToken = await PasswordResetToken.findOne({
            where: {
                token: token
            }
        });

        if (!rfToken) {
            throw new UnauthorizedError("Invalid password reset token");
        }

        if (rfToken.expireDate.getTime() <= Date.now()) {
            throw new HttpError(StatusCodes.GONE, "Token has expired");
        }
    };

    public resetPassword = async (token: string, password: string) => {
        await this.validatePwdResetToken(token);

        const rfToken = await PasswordResetToken.findOne({
            where: {
                token: token
            },
            include: [Account]
        });
        if (rfToken) {
            const account = rfToken.account;
            account.password = await this.encryptPassword(password);
            await account.save();
            await rfToken.destroy();
        } else {
            throw new HttpError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Rftoken null"
            );
        }
    };
}
