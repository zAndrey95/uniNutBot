import mongodb from "mongodb";
import { URL_DB } from './CONST.js'

import { getPairContract } from './contract.js'

const MongoClient = mongodb.MongoClient; 
const client = new MongoClient(URL_DB, {useUnifiedTopology: true});

async function run() {
    try {
        await client.connect();
        console.log("Connected correctly to server");
    } catch (err) {
        console.log(err.stack);
    }
}

run().catch(console.dir);

export const insertOneDB = async (obj) => {
    const db = client.db("uninutbotdb");
    const collection = db.collection("users");
    const data = await collection.findOne({id: obj.id});
    if(!data) {
        collection.insertOne(obj, (err, results) => {
            console.log(results);
            console.log(err)
        });
        return 'You are registered'
    } else {
        return 'You registated'
    }
}

export const getUserInfo = async (id) => {
    const db = client.db("uninutbotdb");
    const collection = db.collection("users");
    const data = await collection.findOne({id: id});
    console.log(data)
    return data;
}

export const getFindMyInfo = async (id) => {
    const db = client.db("uninutbotdb");
    const collection = db.collection("users");
    const data = await collection.findOne({id: id});
    return data ? data?.first_name : 'Haven`t info (please use registration)';
}

export const findOneAndUpdateStep = async (data) => {
    const db = client.db("uninutbotdb");
    const collection = db.collection("users");
    await collection.findOneAndUpdate({id: data.from.id}, { $set: {step: +data.text}});
    await findOneAndUpdatePair(data.from.id)
    return 'Update step'
}

export const findOneAndUpdatePair = async (id) => {
    const db = client.db("uninutbotdb");
    const collection = db.collection("users");
    const pair = await getPairContract()
    console.log(pair)
    await collection.findOneAndUpdate({id: id}, { $set: {pair0: pair[0], pair1: pair[1]}});
    // return 'Update step'
}
