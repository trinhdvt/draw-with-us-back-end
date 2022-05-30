import "dotenv/config";
import {Client} from "redis-om";
import logger from "../utils/Logger";

class RedisClient {
    private static client: Client = null;

    public static async getClient() {
        if (!RedisClient.client || !RedisClient.client.isOpen()) {
            RedisClient.client = await new Client().open(process.env.REDIS_URL);
            logger.debug("Redis client is opened");
        }

        return RedisClient.client;
    }

    public static async closeClient() {
        if (RedisClient.client && RedisClient.client.isOpen()) {
            logger.info("Redis client is closing...");
            await RedisClient.client.close();
        }
    }

    public static async exec(command: Array<string | number | boolean>) {
        return RedisClient.client.execute(command);
    }
}

export default RedisClient;
