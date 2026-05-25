import { dockStart } from "@nlpjs/basic";
import { operateDAO } from "./DAO.js";
import { getTime } from "./Utils.js";

const greetings = {
    "locale": "pt",
    "data": [{
        "intent": "saudacao",
        "utterances": [
            "ola",
            "tudo bem",
            "como esta",
            "bom dia",
            "boa tarde",
            "boa noite",
            "bao",
            "ow",
            "oi"
        ],
        "answers": [
            "Ola, tudo bem?, deseja algo?",
            `${getTime()}, como está, deseja algo?`,
        ]
    },]
}

const loggon = {
    "locale": "pt",
    "data": [{
        "intent": "criar-conta",
        "utterances": [
            "cadastrado",
            "desejo ser cadastrado",
            "cadastre eu",
            "me logga",
            "inicie",
            "comece a ver minhas financas",
            "desejo que crie uma conta",
            "crie uma conta"
        ],
        "answers": [
            "Ok",      //<-- NÃO ACRESCENTAR POIS JA SERA ALTERADA NO METODO response(msg) DO class Session
        ]
    },]
}

const create = {
    "locale": "pt",
    "data": [{
        "intent": "criar-catego",
        "utterances": [
            "crie o campo:",
            "adicione o campo:",
            "insira o campo:",
            "crie a categoria:",
            "adicione a categoria:",
            "insira a categoria:",
            "crie a dispesa:",
            "adicione a dispesa:",
            "insira a dispesa:",
        ],
        "answers": [
            "Ok",      //<-- NÃO ACRESCENTAR POIS JA SERA ALTERADA NO METODO response(msg) DO class Session
        ]
    },]
}

const receipt = {
    "locale": "pt",
    "data": [{
        "intent": "total",
        "utterances": [
            "quero ver todos meus gastos",
            "quero ver minhas despesas",
            "me mostre",
            "quero ver",
            "desejo ver",
            "meus gastos",
            "exiba gastos"
        ],
        "answers": [
            "Ok",      //<-- NÃO ACRESCENTAR POIS JA SERA ALTERADA NO METODO response(msg) DO class Session
        ]
    },]
}

const asking = {
    "locale": "pt",
    "data": [{
        "intent": "extrato",
        "utterances": [
            "receba meu extrato",
            "atualize meus dados",
            "atualize minhas despesas",
            "atualize meus gastos",
            "atualize as informacoes",
        ],
        "answers": [ 
            "Ok, sem problemas, me mande o arquivo nome_do_arquivo.csv do extrato, não mande .pdf ou outro tipo"
        ]
    },]
}

const update = {            //<-- FEITO PURAMENTE PARA LOGICA DO RECEBIMENTO DE ARQUIVO, NÃO MEXER NEM ALTERAR
    "locale": "pt",
    "data": [{
        "intent": "atual",
        "utterances": [
            "parse_de_extrato_concluido_atualizar_dados",
        ],
        "answers": [       //<-- NÃO ACRESCENTAR POIS JA SERA ALTERADA NO METODO response(msg) DO class Session
            "Ok"
        ]
    },]
}

const thanking = {
    "locale": "pt",
    "data": [{
        "intent": "agradecimento",
        "utterances": [
            "obrigado",
            "isso mesmo",
            "ta certo",
            "sou grato",
            "so isso mesmo"
        ],
        "answers": [
            "Que bom ter lhe ajudado",
            "Fico feliz ter ajudado",
        ]
    },]
}

const complaining = {
    "locale": "pt",
    "data": [{
        "intent": "reclamacao",
        "utterances": [
            "esta errado isso",
            "errou",
            "nao ta certo",
            "faltou coisa",
            "nao esta correto"
        ],
        "answers": [
            "Perdão pelo erro",
            "Desculpe-me pelo erro",
        ]
    },]
}

const offending = {
    "locale": "pt",
    "data": [{
        "intent": "ofensa",
        "utterances": [
            "inutil",
            "porcaria",
            "filho da puta",
            "retardado",
            "chimpanzé",
            "burro",
            "gay",
            "viado",
            "desgraçado",
            "cala boca",
        ],
        "answers": [
            "🖕"
        ]
    },]
}

const farewell = {
    "locale": "pt",
    "data": [{
        "intent": "despedida",
        "utterances": [
            "ate",
            "vou sair",
            "tenho que ir",
            "tenho que sair",
            "por enquanto é so isso"
        ],
        "answers": [
            "Até mais, espero ter ajudado",
            "Até outro momento",
            "Ok então, até mais, espero ter sido util",
            "Ok então, até mais, estou sempre disponivel para quando necessitar"
        ]
    },]

}

class Session {

    constructor(insChat) {
        this.chat = insChat
    }

    async response(msg, usr){
        
        this.chat.onIntent = async (nlp, input) => {
            const output = input;
            switch (input.intent) {
        
                case "criar-conta":
                    await operateDAO({
                        op: "createAcc",
                        acc: usr,
                        data: ""
                    })
                    output.answer = "Esta feito, conta criada"
                    break;

                case "criar-catego":
                    await operateDAO({
                        op: "createCat",
                        acc: usr,
                        data: msg.slice( (msg.indexOf(':') + 1), (msg.length))
                    })
                    output.answer = `Pronto, categoria criada`
                    break;

                case "total":
                    const logConta = await operateDAO({
                        op: "checkAcc",
                        acc: usr,
                        data: ""
                    })
                    output.answer = `Esta feito, aqui estâo as informações: \n${logConta}`
                    break;

                case "atual":
                    await operateDAO({
                        op: "update",
                        acc: usr,
                        data: msg
                    })
                    output.answer = `Pronto, o extrato foi recebido e as informações atualizadas`
                    break;

                default: break;
            }
            return input;
        }

        if (typeof msg === 'object') {
            return await this.chat.process("parse_de_extrato_concluido_atualizar_dados")
        }else{
            return await this.chat.process(msg)
        }
    }
}

export async function SessionFactory(insUsrProfil) {
    const dock = await dockStart({ use: ['Basic']});
    const nlp = dock.get('nlp');
    
    nlp.addLanguage('pt');

    nlp.addCorpus(greetings);
    nlp.addCorpus(loggon);
    nlp.addCorpus(create);
    nlp.addCorpus(receipt);
    nlp.addCorpus(update);
    nlp.addCorpus(asking);
    nlp.addCorpus(thanking);
    nlp.addCorpus(complaining);
    nlp.addCorpus(offending);
    nlp.addCorpus(farewell);
    await nlp.train();

    return new Session(nlp, insUsrProfil)
}
