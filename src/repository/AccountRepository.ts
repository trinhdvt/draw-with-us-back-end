import {Service} from "typedi";
import Account from "../models/Account";
import Post from "../models/Post";
import sequelize from "../models";
import {QueryTypes} from "sequelize";

@Service()
export default class AccountRepository {

    public async findByEmail(email: string): Promise<Account | null> {
        return await Account.findOne({
            where: {email: email}
        });
    }

    public async findById(userId: number): Promise<Account | null> {
        return await Account.scope("active").findByPk(userId, {
            include: [{
                model: Account,
                as: 'followingMe',
                attributes: ['id']
            }, {
                model: Post,
                as: 'posts',
                attributes: ['id']
            }]
        });
    }

    public async countTotalBookmark(userId: number): Promise<number> {
        const query = `select count(bp.account_id)
                       from bookmarked_post bp
                                join post p on bp.post_id = p.id
                       where p.account_id = ?`;

        let rs = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: [userId],
        });

        return Number(Object.values(rs[0])[0]);
    }

    public async countTotalComment(userId: number) {
        const query = `select count(c.id)
                       from comment c
                                join post p on c.post_id = p.id
                       where p.account_id = ?`;

        let rs = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: [userId]
        });

        return Number(Object.values(rs[0])[0]);
    }

    public async findByEmailAndEnable(email: string, enabled: boolean): Promise<Account | null> {
        return await Account.findOne({
            where: {
                email: email,
                enabled: enabled
            },
            include: [{
                model: Account,
                as: 'followingMe',
                attributes: ['id']
            }, {
                model: Post,
                as: 'posts',
                attributes: ['id']
            }]
        });
    }

    public async findByRegisterToken(registerToken: string) {
        return await Account.findOne({
            where: {
                registerToken: registerToken,
                enabled: false
            }
        });
    }
}