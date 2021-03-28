import { ChainId, Token, WETH, Fetcher, Route } from '@uniswap/sdk';
import { Telegraf } from 'telegraf';
import Web3 from 'web3';
import mongodb from "mongodb";
const MongoClient = mongodb.MongoClient; 

import ABIGNBU from './ABIGNBU.json'; // gnbu test
import pairAbiJson from './pairAbiJson.json';

const web3 = new Web3('https://ropsten.infura.io/v3/8ca77c4631f14dccb88318200cfca61d')
const CONTRACT = new web3.eth.Contract(ABIGNBU, '0x21AFF2C46C3AB351F18555deb2396284aC7aDC84') // gnbu test

// get pair contract
const PBTC = new Token(3, '0x9b3dcd8aa0fcc5d6dea920a2da28309908fa8a70', 18)

const getPairContract = async () => {
    const pair = await Fetcher.fetchPairData(PBTC, WETH[PBTC.chainId])
    const route = new Route([pair], WETH[PBTC.chainId])

    console.log('PBTC - WETH', route.midPrice.toSignificant(6))
    console.log('WETH - PBTC', route.midPrice.invert().toSignificant(6))

    const result = `PBTC - WETH: ${route.midPrice.toSignificant(6)}`
    return result
}

// contract uniswap
const address = '0xb277A0008b5704b786013D2166370589B837AC3B'
const contract = new web3.eth.Contract(pairAbiJson, address)  

contract.getPastEvents(
    'AllEvents',
    {
      fromBlock: 5854000,
      toBlock: 'latest'
    },
    (err, events) => {
        // console.log(events)
    }
)

// test contract
const getFreeCirculation = async () => {
    const data = await CONTRACT.methods.freeCirculation().call();
    return data;
}

const getBalanceOf = async (address) => {
    const data = await CONTRACT.methods.balanceOf(address).call();
    return data;
}

// db connect
const url = "mongodb+srv://Andrew:Andrew@cluster0.yxjbg.mongodb.net/uninutbotdb?retryWrites=true&w=majority";
const client = new MongoClient(url);

async function run() {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db("uninutbotdb");
        const collection = db.collection("users");
        collection.find().toArray(function(err, results){
            // console.log(results);
        });

    } catch (err) {
        console.log(err.stack);
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

const insertOneDB = async (obj) => {
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

const getFindMyInfo = async (id) => {
    const db = client.db("uninutbotdb");
    const collection = db.collection("users");
    const data = await collection.findOne({id: id});
    return data ? data?.first_name : 'Haven`t info (please use registration)';
}

// bot function
const bot = new Telegraf('1738399962:AAFOcarblTa3ZYlA7z5STs_y3E3o3GH8rSM')

bot.start((ctx) => {
    ctx.reply('Welcome')
    // console.log('ctx', ctx)
    // console.log('ctx.message', ctx.message)
    // console.log('ctx.message.from', ctx.message.from)
    // console.log('ctx.message.from.first_name', ctx.message.from.first_name)
})
bot.hears('token', async ctx => {
    ctx.reply('USD-ETH')
    const data = await getFreeCirculation()
    ctx.reply(data)
})
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.command('freecirculation', async ctx => ctx.reply(await getFreeCirculation()))
bot.command('balanceof', ctx => {
    ctx.reply('Please enter your address')
    bot.on('text', async ctx => ctx.reply(await getBalanceOf(ctx.message.text)))
})
bot.command('registration', async ctx => {
    ctx.reply(await insertOneDB(ctx.message.from))
})
bot.command('myinfo', async ctx => {
    ctx.reply(await getFindMyInfo(ctx.message.from.id))
})
bot.command('getpair', async ctx => {
    ctx.reply(await getPairContract())
})
bot.launch()