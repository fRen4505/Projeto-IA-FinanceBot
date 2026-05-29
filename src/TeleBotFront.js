import { Bot, BotError, GrammyError, HttpError } from "grammy";
import { hydrateFiles } from "@grammyjs/files";
import { SessionFactory } from "./BotNLP.js";

const bot = new Bot("INSERIR CODIGO BOT TELEGRAM");  
bot.api.config.use(hydrateFiles(bot.token));
let chatBotSess

bot.command("start", async (ctx) => {
    chatBotSess = await SessionFactory()
    await ctx.reply(`
        ⚠️Atenção: 
         -Seja claro e curto nos pedidos;
         -Na criação de categorias/dispesas sempre use : (dois pontos) antes do nome da categoria 
         -Escolha um nome distinto para suas categorias, de preferência composto ou nome com sobre nome;
         -Evite erros de escrita ao maximo
    `)
});

bot.on('message:text', async (ctx) => {
    try {
        const resp = await chatBotSess.response(ctx.message.text, ctx.from.id)
        await ctx.reply(resp.answer)
    } catch (error) {
        throw error;
    }
})

bot.on("message:document", async (ctx) => {
    try {
        const file = await ctx.getFile();
        const path = await file.download(
            `./temp/${file.file_path.slice(
                file.file_path.indexOf('/')+1,
                file.file_path.length)
            }`
        );
    
        const resp = await chatBotSess.response(`${path}`, ctx.from.id)
        await ctx.reply(resp.answer)
    } catch (error) {
        throw error
    }
})

bot.on('message:media', async (ctx) => {
    await ctx.reply(`Perdão, mas so vejo e respondo a mensagens de texto e arquivos .csv`)
})

bot.on('message:location', async (ctx) => {
    await ctx.reply(`Perdão, mas so vejo e respondo a mensagens de texto e arquivos .csv`)
})

bot.on('message:contact', async (ctx) => {
    await ctx.reply(`Perdão, mas so vejo e respondo a mensagens de texto e arquivos .csv`)
})

bot.on('message:video', async (ctx) => {
    await ctx.reply(`Perdão, mas não consigo assistir videos`)
})

bot.on('message:voice', async (ctx) => {
    await ctx.reply(`Perdão, mas não consigo escutar audios ou musicas`)
})

bot.catch( async (e) => {
    console.error(e);
    
    try {
        if (e.error instanceof GrammyError) {
            if (e.message = `GrammyError: Call to 'sendMessage' failed! (400: Bad Request: message text is empty)`) {
                await e.ctx.reply('Perdão, não recebi ou compreendi a mensagem');
            } else {
                console.log("Erro do Telegram/API.")
                await e.ctx.reply(e.error.message);
            }

        } else if (e.error instanceof HttpError) {
            console.log("Erro de conexão.")
            await e.ctx.reply(e.error.message);

        } else {
            await e.ctx.reply(`${e.error.message}`);
        }

    } catch (secondary) {
        console.error("ERROR INSIDE bot.catch:");
        console.error(secondary);
    }
    
})

bot.start();
