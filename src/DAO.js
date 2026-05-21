import sqlite3 from "sqlite3";
import { open } from "sqlite";

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

    switch (operation.op) {
        case "createAcc":
            //db.run(
            //    `CREATE TABLE IF NOT EXISTS ${operation.acc} (nome TEXT PRIMARY KEY, total REAL)`
            //)
            break;
    
        case "createCat":
            
            break;
        
        case "checkAcc":
                
            break;
        
        case "update":
    
            break;
        
        default:
            break;
    }
}