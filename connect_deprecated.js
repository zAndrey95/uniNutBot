import Web3 from 'web3'
import pairAbiJson from './pairAbiJson.json'
// const ABI = require('./ABI.json')

const web3 = new Web3('https://ropsten.infura.io/v3/83f110c59bfd4cb596c7a4ac550f569f')

// var web3 = new Web3(Web3.givenProvider || 'ws://remotenode.com:8546');
// or
// const web3 = new Web3('https://ropsten.infura.io/v3/83f110c59bfd4cb596c7a4ac550f569f' || new Web3.providers.WebsocketProvider('ws://ropsten.infura.io/v3/83f110c59bfd4cb596c7a4ac550f569f'));
const eventProvider = new Web3.providers.WebsocketProvider('ws://ropsten.infura.io/v3/83f110c59bfd4cb596c7a4ac550f569f')

// const web3 = new Web3('https://mainnet.infura.io/v3/7d9d43def2584f2a9f01f2a4719327bc')
// const web3 = new Web3('https://mainnet.infura.io/v3/6d302fb37f414514adb2e5441b6bd9a9')

const address = '0xb277A0008b5704b786013D2166370589B837AC3B'
// const address = '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07'

const contract = new web3.eth.Contract(pairAbiJson, address)  

// contract.getPastEvents(
//     'AllEvents',
//     {
//       fromBlock: 5854000,
//       toBlock: 'latest'
//     },
//     (err, events) => { 
//         // console.log(events) 
//     }
// )

var subscription = eventProvider.eth.subscribe('newBlockHeaders', function(error, result){
    if (!error) {
        console.log(result);

        return;
    }

    console.error(error);
})
.on("connected", function(subscriptionId){
    console.log(subscriptionId);
})
.on("data", function(blockHeader){
    console.log(blockHeader);
})
.on("error", console.error);

subscription.unsubscribe(function(error, success){
    if (success) {
        console.log('Successfully unsubscribed!');
    }
});

// contract.events.MyEvent({})
//     .on('data', async function(event){
//         console.log(event.returnValues);
//         // Do something here
//     })
//     .on('error', console.error);

import { ChainId, Token, WETH, Fetcher, Route } from '@uniswap/sdk'

const PBTC = new Token(3, '0x9b3dcd8aa0fcc5d6dea920a2da28309908fa8a70', 18)

const pair = await Fetcher.fetchPairData(PBTC, WETH[PBTC.chainId])

const route = new Route([pair], WETH[PBTC.chainId])

console.log('PBTC - WETH', route.midPrice.toSignificant(6)) // 201.306
console.log('WETH - PBTC', route.midPrice.invert().toSignificant(6)) // 0.00496756