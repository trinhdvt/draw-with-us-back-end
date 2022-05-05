import {Service} from "typedi";
import jwt, {JwtPayload, TokenExpiredError} from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken";
import Account from "../models/Account";
import {ForbiddenError} from "routing-controllers";

@Service()
export default class JwtService {
    private readonly SECRET_KEY: string;
    private readonly EXPIRE_TIME: string;

    constructor() {
        this.SECRET_KEY = process.env.TOKEN_SECRET as string;
        this.EXPIRE_TIME = process.env.TOKEN_TIME as string;
    }

    public createToken = async (account: Account) => {
        const payload = {
            id: account.id,
            email: account.email,
            role: account.role
        }
        const accessToken = jwt.sign(payload,
            this.SECRET_KEY,
            {
                expiresIn: this.EXPIRE_TIME
            });

        // const duration = ms(this.EXPIRE_TIME);

        const refreshToken = await this.createRefreshToken(accessToken, account.email);
        return {accessToken, refreshToken};
    }

    private createRefreshToken = async (accessToken: string, email: string) => {
        const randomString = Math.random().toString(36).substring(2);

        const rfToken = Buffer.from(randomString).toString("base64");
        // save token to db
        const rs = await RefreshToken.findByPk(email);
        if (rs) {
            // update if already exist
            rs.accessToken = accessToken;
            rs.refreshToken = rfToken;
            await rs.save();
        } else {
            // create a new one
            await RefreshToken.create({
                email: email,
                accessToken: accessToken,
                refreshToken: rfToken
            });
        }
        //

        return rfToken;
    }

    public isValidToRefreshToken = async (accessToken: string, refreshToken: string) => {
        const {email} = this.getPayLoad(accessToken);
        const rfToken = await RefreshToken.findByPk(email);

        return (rfToken != null
            && rfToken.refreshToken === refreshToken
            && rfToken.accessToken === accessToken);
    }

    public isValidJwt = (token: string, ignoreExpiration: boolean = false) => {
        try {
            jwt.verify(token, this.SECRET_KEY, {ignoreExpiration: ignoreExpiration});
            return true;
        } catch (err) {
            if (err instanceof TokenExpiredError && !ignoreExpiration) {
                return false;
            }
            // invalid token
            throw new ForbiddenError("Invalid token");
        }
    };

    public getPayLoad = (accessToken: string) => {
        try {
            const decoded = jwt.verify(accessToken, this.SECRET_KEY, {ignoreExpiration: true}) as JwtPayload;
            let {id, email, role} = decoded;

            return {
                id: Number(id),
                email: email as string,
                role: role as string
            }
        } catch (e) {
            // invalid token
            throw new ForbiddenError("Invalid token");
        }
    }

}