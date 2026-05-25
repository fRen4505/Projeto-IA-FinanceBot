import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { stringSimilarity } from "string-similarity-js";

/*  OPERATION OBJECT:
    {
        op: "",                 <-- TYPE OF OPERATION TO DO
        acc: ,                  <-- USER ACCOUNT
        data: ""                <-- INFORMATION THAT WILL BE USED IN THE OPERATION
    }
*/

export async function operateDAO(operation) {

    const db = await open({
        filename: './data.db',
        driver: sqlite3.Database,
    })
    await db.run(`
        CREATE TABLE IF NOT EXISTS users (
            nome TEXT PRIMARY KEY UNIQUE,
            total REAL
        );
    `)

    switch (operation.op) {

        case "createAcc":
            await db.run(`INSERT INTO users (nome, total) VALUES(?,?)`, [operation.acc, 0])

            await db.run(`
                CREATE TABLE IF NOT EXISTS u${operation.acc} (
                    insdata TEXT, 
                    valor REAL, 
                    id TEXT, 
                    data TEXT, 
                    info TEXT, 
                    usr TEXT,
                
                    FOREIGN KEY( usr ) REFERENCES users(nome)
                );
            `)

            await db.run(`
                CREATE TABLE IF NOT EXISTS u${operation.acc}category (
                    categonome TEXT PRIMARY KEY UNIQUE,
                    valor REAL,
                    usercreator TEXT,
                    
                    FOREIGN KEY( usercreator ) REFERENCES users(nome)
                );
            `)

            await db.run(`
                INSERT INTO u${operation.acc}category (categonome, valor, usercreator) VALUES(?,?,?)`
                ,["outros", 0, operation.acc]
            )
            await db.close();
            break;
    
        case "createCat":
            await db.run(
                `INSERT INTO u${operation.acc}category (categonome, valor, usercreator) VALUES(?,?,?)`
                ,[operation.data, 0, operation.acc]
            )
            await db.close();
            break;
        
        case "checkAcc":
            let infos =  await db.get(
                `SELECT total FROM users WHERE users.nome = ?`,[operation.acc]
            ).then( (info) => {
                return `total: ${info.total} \n`
            })

            //  lista de extratos:
            //  LEFT JOIN ${operation.acc} ON users.nome = ${operation.acc}.usr

            await db.each(`
                SELECT * FROM u${operation.acc}category
                WHERE u${operation.acc}category.usercreator = ${operation.acc}
            `, (err, row) => {
                infos = infos + `${row.categonome} | ${row.valor} \n`;
            })

            return infos;
            break;
        
        case "update":
        
            const estratos = await db.prepare(`INSERT INTO u${operation.acc} VALUES (?,?,?,?,?,?)`)
            operation.data.forEach( (obj) => {
                const localDate = new Date()
                if (typeof obj.Valor !== 'undefined') {
                    estratos.run(
                        localDate.toLocaleDateString(), 
                        parseFloat(obj.Valor), 
                        obj.Identificador,
                        obj.Data,
                        obj['Descrição'],
                        operation.acc
                    )
                }
            })
            await estratos.finalize()

            const categoryStack = await db.all(`
                SELECT * FROM u${operation.acc}category 
                WHERE u${operation.acc}category.usercreator = ${operation.acc}
            `).then( (row) =>{ return row })

            const rows = await db.all(`
                SELECT * FROM u${operation.acc}
                WHERE usr = ${operation.acc}
            `)
            for (const row of rows) {                               //FOR EACH DOS EXTRATOS DO USUARIO
                const extratoInfo = (row.info.includes('-')) ? row.info.split('-') : row.info
                const currVal = parseFloat(row.valor)
                
                let matched = false
                for (const cat of categoryStack) {                  //FOR DAS CATEGORIAS E SEUS VALORES ANTERIORES
                    
                    const stratoVal = (typeof extratoInfo === 'object') ? extratoInfo[1] : extratoInfo
                    if (stringSimilarity(stratoVal, cat.categonome) > 0.65) {
                        let matched = true

                        const newVal = await db.get(
                            `SELECT valor FROM u${operation.acc}category WHERE categonome = ? `
                        ,[cat.categonome]).then( (prev) => {
                            const op = currVal + parseFloat(prev.valor)
                            return (op > 0) ? op : 0
                        })

                        await db.run(`
                            UPDATE u${operation.acc}category
                            SET valor = ?
                            WHERE categonome = ?
                        `, [newVal, cat.categonome])
                    }
                }
                if(!matched){

                    const newVal = await db.get(
                        `SELECT valor FROM u${operation.acc}category WHERE categonome = 'outros' `
                    ).then( (prev) => {
                        const op = currVal + parseFloat(prev.valor)
                        return (op > 0) ? op : 0
                    })

                    await db.run(`
                        UPDATE u${operation.acc}category
                        SET valor = ?
                        WHERE categonome = 'outros'
                    `, [newVal])
                }

                const newTotal = await db.get(
                    `SELECT total FROM users WHERE nome = ?`
                ,[operation.acc]).then( (prevTotal) => {
                    const ot = currVal + parseFloat(prevTotal.total)
                    return (ot > 0) ? ot : 0
                })
                
                await db.run(`
                    UPDATE users
                    SET total = ?
                    WHERE nome = ?
                `, [newTotal, operation.acc])
                
            }
            break;
        
        default:
            break;
    }
}