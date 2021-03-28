import { ChainId, Token, WETH, Fetcher, Route } from '@uniswap/sdk';
import { Telegraf }  from 'telegraf';
import { keyboard, inlineKeyboard, callbackButton } from 'telegraf/markup'

// import { Markup } from 'telegraf/markup'
// const Extra = require('telegraf/extra')
// const Markup = require('telegraf/markup')
import Web3 from 'web3';
import mongodb from "mongodb";
const MongoClient = mongodb.MongoClient; 

console.log('Markup', Markup)

import abi from './abi.json'
import pairAbiJson from './pairAbiJson.json'

const web3 = new Web3('https://ropsten.infura.io/v3/8ca77c4631f14dccb88318200cfca61d')
const SWAP_CONTRACT = new web3.eth.Contract(pairAbiJson, '0xb277A0008b5704b786013D2166370589B837AC3B') // Swap
const CUSTOME_CONTRACT = new web3.eth.Contract(abi, '0xE9eDd00aa3891145348a58cD7ea9C1d377C15a29') // getBurn

web3.setProvider(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/7d9d43def2584f2a9f01f2a4719327bc'));

const convertToken = '0xc11090b333e0a8a88cb5d26f1f663cf859fcb861'

// get pair contract
const PBTC = new Token(3, '0x9b3dcd8aa0fcc5d6dea920a2da28309908fa8a70', 8)
const PUSD = new Token(3, '0xc11090b333e0a8a88cb5d26f1f663cf859fcb861', 18)

const getSwap = async (ctx) => {
    console.log('start')
    const step = await getStepUser(ctx.message.from.id);
    console.log(step); // number or undefined

    await SWAP_CONTRACT.events.Swap({})
    .on("connected", function(subscriptionId){
        console.log('subscriptionId', subscriptionId);
    })
    .on('data', async function(event){
        console.log('data');
        console.log(event);
        // ctx.reply(await getPairContract())
        // ctx.reply(await getBurnAmountConvert())
    })
    .on('error', console.error);
}

const getBurnAmountConvert = async () => {
    console.log('getBurnAmountConvert');
    const data = await CUSTOME_CONTRACT.methods.getBurnAmountConvert(1000000000000000000n, convertToken).call();
    console.log(data);
    return data;
}

// getBurnAmountConvert()

const getPairContract = async () => {
    try {
        const pair = await Fetcher.fetchPairData(PBTC, WETH[PBTC.chainId])
        const route = new Route([pair], WETH[PBTC.chainId])

        console.log('PBTC - WETH', await route.midPrice.toSignificant())
        console.log('WETH - PBTC', await route.midPrice.invert().toSignificant())

        const result = `PBTC - WETH: ${await route.midPrice.toSignificant(6)}`
        return result
    } catch (error) {
        console.log('error', error)
        return 'Sorry'
    }
}

getPairContract()

// db connect
const url = "mongodb+srv://Andrew:Andrew@cluster0.yxjbg.mongodb.net/uninutbotdb?retryWrites=true&w=majority";
const client = new MongoClient(url, {useUnifiedTopology: true});

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

const getStepUser = async (id) => {
    const db = client.db("uninutbotdb");
    const collection = db.collection("users");
    const data = await collection.findOne({id: id});
    console.log(data)
    return data ? data?.step : 'Haven`t info about step';
}

const getFindMyInfo = async (id) => {
    const db = client.db("uninutbotdb");
    const collection = db.collection("users");
    const data = await collection.findOne({id: id});
    return data ? data?.first_name : 'Haven`t info (please use registration)';
}

const findOneAndUpdate = async (data) => {
    const db = client.db("uninutbotdb");
    const collection = db.collection("users");
    await collection.findOneAndUpdate({id: data.from.id}, { $set: {step: +data.text}});
    return 'Update step'
}

// bot function
const bot = new Telegraf('1738399962:AAFOcarblTa3ZYlA7z5STs_y3E3o3GH8rSM')

// const menu = () => {
//     return Telegraf.Extra
//       .markup((m) =>
//         m.inlineKeyboard([
//           [
//             m.callbackButton('Press 0', '0'),
//             m.callbackButton('Press 1', '1')
//           ]
//         ])
//       )
//   };

bot.start((ctx) => {
    ctx.reply('Welcome')
    // console.log('ctx', ctx)
    // console.log('ctx.message', ctx.message)
    // console.log('ctx.message.from', ctx.message.from)
    // console.log('ctx.message.from.first_name', ctx.message.from.first_name)
})
// bot.start(ctx => {
//     ctx.reply(
//       `Hello ${ctx.from.first_name}. Сhoose one of the commands`,
//       Markup.inlineKeyboard([
//         Markup.callbackButton("Curse", "curse"),
//         Markup.callbackButton("Convert", "convert")
//       ]).extra()
//     );
//   });
bot.hears('token', async ctx => {
    ctx.reply('USD-ETH')
    const data = await getFreeCirculation()
    ctx.reply(data)
})
bot.hears('🔍 Search', ctx => ctx.reply('Yay!'))
bot.hears('📢 Ads', ctx => ctx.reply('Free hugs. Call now!'))
bot.command('custom', (ctx) => {
    ctx.reply(
      `Hello ${ctx.from.first_name}. Сhoose one of the commands`,
      inlineKeyboard([
        ['🔍 Search', '😎 Popular'], // Row1 with 2 buttons
      ])
    );
  });
// bot.command('custom', ({ reply }) => {
//     return reply('Custom buttons keyboard', Markup
//         .button.text('stst')
//       .keyboard([
//         ['🔍 Search', '😎 Popular'], // Row1 with 2 buttons
//         ['☸ Setting', '📞 Feedback'], // Row2 with 2 buttons
//         ['📢 Ads', '⭐️ Rate us', '👥 Share'] // Row3 with 3 buttons
//       ])
//     )
//   })
// bot
//     .on('message', (ctx) => {
//     ctx.reply("Выберите действие.", menu());
//     })
//     .on('callback_query', (ctx) => {
//         // отвечаем телеграму что получили от него запрос
//         ctx.answerCbQuery();
//         // удаляем сообщение
//         ctx.deleteMessage();
//         // отвечаем на нажатие кнопки
//         ctx.reply('You press ', ctx.callbackQuery.data, menu())
//       });
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.command('registration', async ctx => {
    ctx.reply(await insertOneDB(ctx.message.from))
})
bot.command('myinfo', async ctx => {
    ctx.reply(await getFindMyInfo(ctx.message.from.id))
})
bot.command('getpair', async ctx => {
    await getSwap(ctx)
})
bot.command('getstep', async ctx => {
    ctx.reply('Please enter step')
    bot.on('text', async ctx => ctx.reply(await findOneAndUpdate(ctx.message)))
})
bot.launch()