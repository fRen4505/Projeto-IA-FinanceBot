import { dockStart } from "@nlpjs/basic";
import { operateDAO } from "./DAO.js";
import { Process, getTime } from "./Utils.js";

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
            "Ola, tudo bem? deseja algo?",
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
            "crie uma nova categoria",
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
            "me mostre minha conta",
            "exiba minha conta",
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
            "receba meus extratos",
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
            "./temp/file.csv",
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
            "Denada"
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
        try {
            this.chat.onIntent = async (nlp, input) => {
                const output = input;

                switch (input.intent) {
                    case "criar-conta":
                        const contaStatus = await operateDAO({
                            op: "createAcc",
                            acc: usr,
                            data: ""
                        })
                        output.answer = `${ (contaStatus === 'Sucesso') ? `${contaStatus}, conta criada` : 'não foi possivel cadastrar'}`
                        break;

                    case "criar-catego":
                        if (msg.includes(':')) {
                            const catStatus = await operateDAO({
                                op: "createCat",
                                acc: usr,
                                data: msg.slice( (msg.indexOf(':') + 1), (msg.length))
                            })
                            output.answer = `${ (catStatus === 'Pronto') ? `${catStatus}, categoria criada` : 'não foi possivel criar'}`
                        }else{
                            throw new Error("unclear categ");
                        }
                        break;

                    case "total":
                        const logConta = await operateDAO({
                            op: "checkAcc",
                            acc: usr,
                            data: ""
                        })
                        output.answer = `${logConta}`
                        break;

                    case "atual":
                        const extraStatus = await operateDAO({
                            op: "update",
                            acc: usr,
                            data: await Process(msg)
                        })
                        output.answer = `${ (extraStatus === 'Concluido') ? `${extraStatus}, extrato foi recebido e as informações atualizadas` : 'não foi possivel ler' }`
                        break;
                    default: break;
                }
                return input;

            }
            return await this.chat.process(msg)

        } catch (error) {
            console.log(error)
            switch (error.message) {
                case `SQLITE_ERROR: no such table: u${usr}category`:
                    throw new Error("Vocẽ não possui conta para poder criar uma categoria");
                    break;

                case `SQLITE_CONSTRAINT: UNIQUE constraint failed: users.nome`:
                    throw new Error("Você ja possui uma conta cadastrada");
                    break;

                case `SQLITE_CONSTRAINT: UNIQUE constraint failed: u${usr}.id`:
                    throw new Error("Você ja enviou este arquivo ou similar");
                    break;
                
                case `SQLITE_CONSTRAINT: UNIQUE constraint failed: u${usr}category.categonome`:
                    throw new Error("Você ja criou essa categoria");
                    break;
                
                case 'non op':
                    throw new Error("Perdão, não foi possivel");
                    break;
                
                case 'non .csv':
                    throw new Error("Perdão, porem só interpreto e recebo arquivos .csv");
                    break;

                case 'read err':
                    throw new Error("Perdão, não consegui ler o arquivo enviado");
                    break;

                case 'unclear categ':
                    throw new Error("Não entendi o nome da categoria, coloque : (dois pontos) antes do nome dela \nNão se esqueça de usar nomes claros e distintos");
                    break;

                default:
                    throw new Error("Perdão, não entendi a mensagem");
                    break;
            }
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
