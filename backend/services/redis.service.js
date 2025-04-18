// import { Redis } from "ioredis";
const {Redis} = require('ioredis');
const { REDIS_HOST='127.0.0.1', REDIS_PORT='6379' } = process.env;

if (!REDIS_HOST) throw Error("Missing env: REDIS_HOST");
if (!REDIS_PORT) throw Error("Missing env: REDIS_PORT");

const redis = new Redis({
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on("connect", () => {
  console.log(`Redis: connected - ${REDIS_HOST}:${REDIS_PORT}`);
});
redis.on("error", (err) => console.log("Redis: error", err));

class RedisService {
   key;

  constructor(key) {
    this.key = key;
  }

  async set(value) {
    const processedValue = this._serialize(value);
    await redis.set(this.key, processedValue);
  }

  async get() {
    const value = await redis.get(this.key);
    return this._deserialize(value);
  }

  async setWithTTL(value, ttl) {
    const processedValue = this._serialize(value);
    await redis.set(this.key, processedValue, "EX", ttl);
  }

  async getTTL() {
    return await redis.ttl(this.key);
  }

  async hset(field, value) {
    const processedValue = this._serialize(value);
    await redis.hset(this.key, field, processedValue);
  }

  async hget(field) {
    const value = await redis.hget(this.key, field);
    return this._deserialize(value);
  }

  async hgetAll() {
    const data = await redis.hgetall(this.key);
    Object.keys(data).forEach((field) => {
      data[field] = this._deserialize(data[field]);
    });
    return data;
  }

  async setWithExpire(value, expireTime) {
    const processedValue = this._serialize(value);
    await redis.setex(this.key, expireTime, processedValue);
  }

  async delete() {
    await redis.del(this.key);
  }

  async exists(){
    return (await redis.exists(this.key)) === 1;
  }

  async incr(){
    return await redis.incr(this.key);
  }

  async decr() {
    return await redis.decr(this.key);
  }

   _serialize(value) {
    if (typeof value === "number" || typeof value === "boolean") {
      return value.toString();
    } else if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    } else {
      return value;
    }
  }

   _deserialize(value) {
    if (!value) return null;
    if (!isNaN(Number(value)) && value.trim() !== "") return Number(value);
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }
}

module.exports =  RedisService;