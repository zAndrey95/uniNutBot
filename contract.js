import { ChainId, Token, WETH, Fetcher, Route } from '@uniswap/sdk';
import Web3 from 'web3';

import abi from './abi/abi.json'
import pairAbiJson from './abi/pairAbiJson.json'

import { getUserInfo } from './db.js'

const link = 'https://hackathon314nat.netlify.app/'

const web3 = new Web3('https://ropsten.infura.io/v3/8ca77c4631f14dccb88318200cfca61d')
const SWAP_CONTRACT = new web3.eth.Contract(pairAbiJson, '0xb277A0008b5704b786013D2166370589B837AC3B') // Swap
const CUSTOME_CONTRACT = new web3.eth.Contract(abi, '0xE9eDd00aa3891145348a58cD7ea9C1d377C15a29') // getBurn

web3.setProvider(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/7d9d43def2584f2a9f01f2a4719327bc'));

const convertToken = '0xc11090b333e0a8a88cb5d26f1f663cf859fcb861'

// get pair contract
const PBTC = new Token(3, '0x9b3dcd8aa0fcc5d6dea920a2da28309908fa8a70', 8)
const PUSD = new Token(3, '0xc11090b333e0a8a88cb5d26f1f663cf859fcb861', 18)

const changeListen = async (ctx) => {
    const data = await getUserInfo(ctx.message.from.id);
    console.log(data.step); // number or undefined
    console.log(data.pair0);
    console.log(data.pair1);

    if(data.step) {
        const pair = await getPairContract();
        const res1 = (pair[0] - data.pair0)/data.pair0 * 100;
        const res2 = (pair[1] - data.pair1)/data.pair1 * 100;
        console.log(res1)
        console.log(res2)
        console.log(data.step)
        data.step >= res1 || data.step >= res2
            ? ctx.reply(`PBTC - WETH: ${pair[0]} \n WETH - PBTC: ${pair[1]}`)
            : null
    } else {
        const pair = await getPairContract();
        ctx.reply(`PBTC - WETH: ${pair[0]} \n WETH - PBTC: ${pair[1]}`)
    }
}

export const getSwap = async (ctx) => {
    console.log('start')
    // const data = await getUserInfo(ctx.message.from.id);
    // console.log(data.step); // number or undefined
    // console.log(data.pair0);
    // console.log(data.pair1);

    // const pair = await getPairContract();
    // console.log(pair);
    // ctx.reply(`PBTC - WETH: ${pair[0]} \nWETH - PBTC: ${pair[1]}`)

    await SWAP_CONTRACT.events.Swap({})
    .on("connected", function(subscriptionId){
        console.log('subscriptionId', subscriptionId);
    })
    .on('data', async function(event){
        console.log('data');
        console.log(event);
        await changeListen(ctx)
        // const pair = await getPairContract();
        // ctx.reply(`PBTC - WETH: ${pair[0]} \n WETH - PBTC: ${pair[1]}`)
        // ctx.reply(await getBurnAmountConvert())
    })
    .on('error', console.error);
}

export const getBurnAmountConvert = async () => {
    console.log('getBurnAmountConvert');
    const data = await CUSTOME_CONTRACT.methods.getBurnAmountConvert(1000000000000000000n, convertToken).call();
    console.log(data);
    return data;
}

export const getPairContract = async () => {
    try {
        const pair = await Fetcher.fetchPairData(PBTC, WETH[PBTC.chainId])
        const route = new Route([pair], WETH[PBTC.chainId])

        console.log('PBTC - WETH', await route.midPrice.toSignificant())
        console.log('WETH - PBTC', await route.midPrice.invert().toSignificant())

        const PBTC_WETH = await route.midPrice.toSignificant(6)
        const WETH_PBTC = await route.midPrice.invert().toSignificant(6)
        return [PBTC_WETH, WETH_PBTC]
    } catch (error) {
        console.log('error', error)
        return 'Sorry'
    }
}

export const getAmountOut = async (count, bool) => {
    console.log('getAmountOut');
    console.log(count);
    // нужно понять на какое число множить
    const value = +count * 1000000000000000000;
    console.log('value', value)
    const data = await CUSTOME_CONTRACT.methods.getAmountOut(value.toString(), bool).call();
    console.log(data);
    const newLink = `${link}${data.counterTokenAmount}/${data.indexAmount}`;
    console.log(newLink);
    return newLink;
}

export const getBurnAmount = async (count, bool) => {
    console.log('getBurnAmount');
    console.log(count);
    const data = await CUSTOME_CONTRACT.methods.getBurnAmount(count).call();
    console.log(data);
    const newLink = `${link}${data.amount0}/${data.amount1}`;
    return newLink;
}
