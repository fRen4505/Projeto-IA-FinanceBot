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

    async function createCateg(usr, catNam) {
        await db.run(`INSERT INTO u${usr}category (categonome, valor, gastos, usercreator) VALUES(?,?,?,?)`,[catNam, 0, 0, usr]).catch(err => {throw err})
    }

    async function dataUpdate() {

        try {
            let categObj = {}
                    
            await db.all(`
                SELECT * FROM u${operation.acc}category 
                WHERE u${operation.acc}category.usercreator = ${operation.acc}
            `).then( (row) => { 
                row.forEach( cat => { categObj[`${cat.categonome}`] = [0, 0] }) 
            }).catch(err => {throw err})

            const extratos = await db.all(`
                SELECT * FROM u${operation.acc}
                WHERE usr = ${operation.acc}
            `).catch(err => {throw err})

            let total = 0
            for (const extrat of extratos) {
                if (typeof extrat.valor !== 'undefined') {
                        
                    const currVal = parseFloat(extrat.valor)
                    const currInfo =  (extrat.info.includes('-')) ? extrat.info.split('-') : extrat.info
                    const toUpdate = (currVal > 0) ? 1 : 0
                            
                    let matched = false
                    for (const cat of Object.keys(categObj)) {
                        const stratoVal = (typeof currInfo === 'object') ? currInfo[1] : currInfo

                        if (stringSimilarity(stratoVal, cat) > 0.65) {
                            matched = true
                            categObj[cat][toUpdate] += currVal
                        }
                    }
                    if (!matched) {
                        categObj['outros'][toUpdate] += currVal  
                    }
                        
                    const ct = currVal + total
                    total = (ct > 0) ? ct : 0
                }
            }
            await db.run( `UPDATE users SET total = ? WHERE nome = ?`, [total, operation.acc])
                .catch(err => {throw err})

            for (const [catName, vals] of Object.entries(categObj)) {
                await db.run(`
                    UPDATE u${operation.acc}category 
                    SET valor = ?, gastos = ? 
                    WHERE categonome = ?
                    `, [vals[1], vals[0], catName]
                ).catch(err => {throw err})
            }

        } catch (error) {
            throw error;
        }
    }

    switch (operation.op) {

        case "createAcc":
            try {
                await db.run(`
                    CREATE TABLE IF NOT EXISTS u${operation.acc} (
                        insdata TEXT, 
                        valor REAL, 
                        id TEXT UNIQUE,
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
                        gastos REAL,
                        usercreator TEXT,
                        
                        FOREIGN KEY( usercreator ) REFERENCES users(nome)
                    );
                `)

                await db.run(`INSERT INTO users (nome, total) VALUES(?,?)`, [operation.acc, 0])
                    .catch(err => {throw err})

                await createCateg(operation.acc, 'outros')
                return 'Sucesso';

            } catch (error) {
                throw error;
            }
            break;
    
        case "createCat":
            try {
                await createCateg(operation.acc, operation.data)
                await dataUpdate()
                return 'Pronto';
            } catch (error) {
                throw error
            }
            break;
        
        case "checkAcc":
            try {
                let infos = await db.get( `SELECT * FROM users WHERE users.nome = ?`, [operation.acc])
                    .then( (usr) => { return `total: ${usr.total}\ncategorias:\n`})
                    .catch(err => {throw err})

                await db.each(`
                    SELECT * FROM u${operation.acc}category
                    WHERE u${operation.acc}category.usercreator = ${operation.acc}
                `, (err, row) => {
                    infos = infos + `=>${row.categonome} | Recebidos: ${row.valor} | Gastos: ${row.gastos}\n`;
                })

                return infos;
            } catch (error) {
                throw error 
            }
            break;
        
        case "update":
            try {
                for (const extrat of operation.data) {
                    if (typeof extrat.Valor !== 'undefined') {
                        const localDate = new Date()
                        await db.run(
                            `INSERT INTO u${operation.acc} VALUES (?,?,?,?,?,?)`, [
                                localDate.toLocaleDateString(), 
                                parseFloat(extrat.Valor), 
                                extrat.Identificador, 
                                extrat.Data, 
                                extrat['Descrição'], 
                                operation.acc
                            ]
                        ).catch(err => {throw err})
                    }
                }

                await dataUpdate();
                return 'Concluido';

            } catch (error) {
                throw error;
            }
            break;
        
        default:
            throw new Error("non op");
            break;
    }
}