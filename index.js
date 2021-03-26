const { Telegraf } = require('telegraf')
const Web3 = require('web3')
const ABI = require('./ABI.json')
// import Web3 from 'web3'
// import ABI from './ABI.json'

const bot = new Telegraf('1738399962:AAFOcarblTa3ZYlA7z5STs_y3E3o3GH8rSM')

const web3 = new Web3('https://ropsten.infura.io/v3/8ca77c4631f14dccb88318200cfca61d')
const CONTRACT = new web3.eth.Contract(ABI, '0x21AFF2C46C3AB351F18555deb2396284aC7aDC84')

const getFreeCirculation = async () => {
    const data = await CONTRACT.methods.freeCirculation().call();
    return data;
}

const getBalanceOf = async (address) => {
    const data = await CONTRACT.methods.balanceOf(address).call();
    return data;
}

bot.start((ctx) => {
    ctx.reply('Welcome')
    // console.log('ctx', ctx)
    // console.log('ctx.message', ctx.message)
    console.log('ctx.message.from', ctx.message.from)
    console.log('ctx.message.from.first_name', ctx.message.from.first_name)
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
bot.launch()