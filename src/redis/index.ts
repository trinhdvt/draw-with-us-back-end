import "dotenv/config";
import {Client} from "redis-om";

class RedisClient {
    private static client: Client = null;

    public static async getClient() {
        if (!RedisClient.client || !RedisClient.client.isOpen()) {
            RedisClient.client = await new Client().open(process.env.REDIS_URL);
        }

        return RedisClient.client;
    }

    public static async closeClient() {
        if (RedisClient.client) {
            console.info("Redis client is closing...");
            await RedisClient.client.close();
        }
    }
}

export default RedisClient;
