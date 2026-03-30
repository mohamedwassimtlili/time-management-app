import Redis from "ioredis";
import express from "express";
const redis = new Redis();
const app = express();


const testQueue = async() => {
    await redis
}

