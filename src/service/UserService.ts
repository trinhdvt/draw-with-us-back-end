import {Service} from "typedi";
import AccountRepository from "../repository/AccountRepository";
import {NotFoundError} from "routing-controllers";
import {AccountDto} from "../dto/AccountDto";
import Account from "../models/Account";

@Service()
export default class UserService {

    constructor(private accRepo: AccountRepository) {
    }

    public async getUserInfoById(userId: number, curUserId: number | undefined) {
        const acc = await this.accRepo.findById(userId);
        if (!acc) {
            throw new NotFoundError("Account not found");
        }

        return await this.accountDetailMapping(acc, curUserId);
    }

    public async getUserInfoByEmail(email: string, curUserId: number | undefined) {
        const acc = await this.accRepo.findByEmailAndEnable(email, true);
        if (!acc) {
            throw new NotFoundError("Account not found");
        }

        return await this.accountDetailMapping(acc, curUserId);
    }

    private async accountDetailMapping(acc: Account, curUserId: number) {
        const accountDto = AccountDto.toBasicAccount(acc);
        accountDto.postCount = acc.posts.length;
        accountDto.followCount = acc.followingMe.length;
        accountDto.bookmarkOnOwnPostCount = await this.accRepo.countTotalBookmark(acc.id);
        accountDto.commentOnOwnPostCount = await this.accRepo.countTotalComment(acc.id);

        for (const f of acc.followingMe) {
            if (f.id == curUserId) {
                accountDto.isFollowed = true;
                break;
            }
        }

        return accountDto;
    }

}