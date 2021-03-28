import { Telegraf, Markup } from 'telegraf'

import { TOKEN_BOT } from './CONST.js'
import { insertOneDB, getFindMyInfo, findOneAndUpdateStep, findOneAndUpdatePair } from './db.js'
import { getSwap, getAmountOut, getBurnAmount, getPairContract } from './contract.js'

// initializite bot
const bot = new Telegraf(TOKEN_BOT)

bot.start((ctx) => {
    ctx.reply('Welcome BOT 3.14nut')
})
bot.command('menu', async (ctx) => {
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

bot.hears('📞 Registration', async ctx => {
    ctx.reply(await insertOneDB(ctx.message.from))
})
bot.hears('👤 My info', async ctx => {
    ctx.reply(await getFindMyInfo(ctx.message.from.id))
})
bot.hears('WETH Exchange', async ctx => {
    ctx.reply('Please enter value WETH')
    bot.on('text', async ctx => {
        const pairETH = await getPairContract();
        console.log('WETH1', pairETH)
        console.log('WETH1', pairETH[0])
        const value = ctx.message.text;
        const count = value * pairETH[0];
        console.log('WETH2', count, value)
        ctx.reply(`You can buy: ${count} PBTC`)
    })
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
bot.hears('PBTC Exchange', async ctx => {
    ctx.reply('Please enter value PBTC')
    bot.on('text', async ctx => {
        const pair = await getPairContract();
        console.log('PBTC1', pair)
        console.log('PBTC1', pair[1])
        const value = ctx.message.text;
        const count = value * pair[1];
        console.log('PBTC2', count, value)
        ctx.reply(`You can buy: ${count} WETH`)
    })
})
bot.hears('📊 Get rait', async ctx => {
    await getSwap(ctx)
})
bot.hears('⚙ Set step', async ctx => {
    ctx.reply('Please enter step')
    bot.on('text', async ctx => ctx.reply(await findOneAndUpdateStep(ctx.message)))
    bot.on('text', async ctx => ctx.reply(await findOneAndUpdatePair(ctx)))
})
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
bot.hears('₿ PBTC', async ctx => {
    ctx.reply('₿ PBTC')
    ctx.reply('Please enter value')
    bot.on('text', async ctx => ctx.reply(await getAmountOut(ctx.message.text, true)))
})
bot.hears('Ë WETH', async ctx => {
    ctx.reply('Ë WETH')
    ctx.reply('Please enter value')
    bot.on('text', async ctx => ctx.reply(await getAmountOut(ctx.message.text, false)))
})
bot.hears('📈 Burn amount', async ctx => {
    ctx.reply('Please enter value iToken')
    bot.on('text', async ctx => ctx.reply(await getBurnAmount(ctx.message.text)))
})
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

bot.launch()