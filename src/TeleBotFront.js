import { Bot } from "grammy";
import { hydrateFiles } from "@grammyjs/files";
import { SessionFactory } from "./BotNLP.js";
import { Process } from "./Utils.js";

const bot = new Bot("INSERIR CODIGO DE BOT");
bot.api.config.use(hydrateFiles(bot.token));
let chatBotSess

bot.command("start", async (ctx) => {
    chatBotSess = await SessionFactory()
});

bot.on('message:text', async (ctx) => {
    const resp = await chatBotSess.response(ctx.message.text, ctx.from.id)
    ctx.reply(resp.answer)
})

bot.on("message:document", async (ctx) => {
    const file = await ctx.getFile();
    const path = await file.download("./temp/file.csv");
    const processed = await Process(`${path}`)

    const resp = await chatBotSess.response(processed, ctx.from.id)
    ctx.reply(resp.answer)
})

bot.start();
