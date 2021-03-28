import { Telegraf, Markup, Scenes, session } from 'telegraf'

import { TOKEN_BOT } from './CONST.js'
import { insertOneDB, getFindMyInfo, findOneAndUpdateStep, findOneAndUpdatePair } from './db.js'
import { getSwap, getAmountOut, getBurnAmount, getPairContract } from './contract.js'

// Handler factoriess
const { enter, leave } = Scenes.Stage

// initializite bot
const bot = new Telegraf(TOKEN_BOT)

// stepScene scene
const stepScene = new Scenes.BaseScene('setStep')
stepScene.enter((ctx) => ctx.reply('Please enter step'))
// stepScene.hears('hi', enter('greeter'))
stepScene.on('text', async (ctx) => {
    ctx.reply(await findOneAndUpdateStep(ctx.message)),
    ctx.reply(await findOneAndUpdatePair(ctx)),
    leave()
})
stepScene.leave((ctx) => ctx.reply('Bye'))

// burnScene scene
const burnScene = new Scenes.BaseScene('burnAmount')
burnScene.enter((ctx) => ctx.reply('Please enter value iToken'))
burnScene.on('text', async (ctx) => ctx.reply(await getBurnAmount(ctx.message.text)))
burnScene.leave((ctx) => ctx.reply('Bye'))

// amountOutPBTC scene
const amountOutPBTCScene = new Scenes.BaseScene('amountOutPBTC')
amountOutPBTCScene.enter((ctx) => ctx.reply('Please enter value PBTC'))
amountOutPBTCScene.on('text', async (ctx) => ctx.reply(await getAmountOut(ctx.message.text, true)))
amountOutPBTCScene.leave((ctx) => ctx.reply('Bye'))
// amountOutWETH scene
const amountOutWETHScene = new Scenes.BaseScene('amountOutWETH')
amountOutWETHScene.enter((ctx) => ctx.reply('Please enter value WETH'))
amountOutWETHScene.on('text', async (ctx) => ctx.reply(await getAmountOut(ctx.message.text, false)))
amountOutWETHScene.leave((ctx) => ctx.reply('Bye'))

// calculationWETHScene 
const calculationWETHScene = new Scenes.BaseScene('calculationWETH')
calculationWETHScene.enter((ctx) => ctx.reply('Please enter value WETH'))
calculationWETHScene.on('text', async (ctx) => {
    const pairETH = await getPairContract();
    const value = ctx.message.text;
    const count = value * pairETH[0];
    await ctx.reply(`You can buy: ${count} PBTC`)
})
calculationWETHScene.leave((ctx) => ctx.reply('Bye'))
// calculationPBTCScene 
const calculationPBTCScene = new Scenes.BaseScene('calculationPBTC')
calculationPBTCScene.enter((ctx) => ctx.reply('Please enter value PBTC'))
calculationPBTCScene.on('text', async (ctx) => {
    const pairETH = await getPairContract();
    const value = ctx.message.text;
    const count = value * pairETH[1];
    await ctx.reply(`You can buy: ${count} WETH`)
})
calculationPBTCScene.leave((ctx) => ctx.reply('Bye'))

const stage = new Scenes.Stage([stepScene, burnScene, amountOutPBTCScene, calculationWETHScene, calculationPBTCScene], { ttl: 10 })

bot.use(session())
bot.use(stage.middleware())

// bot.start((ctx) => {
//     ctx.reply('Welcome BOT 3.14nut')
// })
bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
})
bot.start((ctx) => {
    ctx.reply('Welcome BOT 3.14nut')
})
bot.command('menu', async (ctx) => {
    return await ctx.reply('Custom buttons keyboard', Markup
      .keyboard([
        ['📞 Registration', '👤 My info'], // Row1 with 2 buttons
        ['⚙ Set step', '📊 Get rate'], // Row2 with 2 buttons
        ['🧮 Calculation', '📈 Burn amount', '📉 Amount out'] // Row3 with 3 buttons
      ])
      .oneTime()
      .resize()
      .extra()
    )
})
bot.hears('📞 Registration', async ctx => {
    ctx.reply(await insertOneDB(ctx.message.from))
})
bot.hears('👤 My info', async ctx => {
    ctx.reply(await getFindMyInfo(ctx.message.from.id))
})
bot.hears('🧮 Calculation', async ctx => {
    const pair = await getPairContract();
    ctx.reply(`PBTC - WETH: ${pair[0]} \nWETH - PBTC: ${pair[1]}`)
    return await ctx.reply('Exchange token', Markup
      .keyboard([
        ['PBTC Exchange', 'WETH Exchange'],
        ['Return']
      ])
    )
})
bot.hears('WETH Exchange', async ctx => ctx.scene.enter('calculationWETH'))
bot.hears('PBTC Exchange', async ctx => ctx.scene.enter('calculationPBTC'))
// bot.hears('WETH Exchange', async ctx => {
//     ctx.reply('Please enter value WETH')
//     bot.on('text', async ctx => {
//         const pairETH = await getPairContract();
//         console.log('WETH1', pairETH)
//         console.log('WETH1', pairETH[0])
//         const value = ctx.message.text;
//         const count = value * pairETH[0];
//         console.log('WETH2', count, value)
//         ctx.reply(`You can buy: ${count} PBTC`)
//     })
// })
// bot.hears('PBTC Exchange', async ctx => {
//     ctx.reply('Please enter value PBTC')
//     bot.on('text', async ctx => {
//         const pair = await getPairContract();
//         console.log('PBTC1', pair)
//         console.log('PBTC1', pair[1])
//         const value = ctx.message.text;
//         const count = value * pair[1];
//         console.log('PBTC2', count, value)
//         ctx.reply(`You can buy: ${count} WETH`)
//     })
// })
bot.hears('📊 Get rate', async ctx => {
    await getSwap(ctx)
})
bot.hears('⚙ Set step', async ctx => ctx.scene.enter('setStep') )
bot.hears('📉 Amount out', async ctx => {
    return await ctx.reply('Change token', Markup
      .keyboard([
        ['₿ PBTC', 'Ë WETH'],
        ['Return']
      ])
      .oneTime()
      .resize()
    )
})
bot.hears('₿ PBTC', async ctx => ctx.scene.enter('amountOutPBTC'))
bot.hears('Ë WETH', async ctx => ctx.scene.enter('amountOutWETH'))

// bot.hears('₿ PBTC', async ctx => {
//     ctx.reply('₿ PBTC')
//     ctx.reply('Please enter value')
//     bot.on('text', async ctx => ctx.reply(await getAmountOut(ctx.message.text, true)))
// })

// bot.hears('Ë WETH', async ctx => {
//     ctx.reply('Ë WETH')
//     ctx.reply('Please enter value')
//     bot.on('text', async ctx => ctx.reply(await getAmountOut(ctx.message.text, false)))
// })
bot.hears('📈 Burn amount', async ctx => ctx.scene.enter('burnAmount'))
bot.hears('Return', async ctx => {
    return await ctx.reply('Custom buttons keyboard', Markup
        .keyboard([
        ['📞 Registration', '👤 My info'], // Row1 with 2 buttons
        ['⚙ Set step', '📊 Get rait'], // Row2 with 2 buttons
        ['🧮 Calculation', '📈 Burn amount', '📉 Amount out'] // Row3 with 3 buttons
        ])
        .oneTime()
        .resize()
    )
})

bot.startPolling()