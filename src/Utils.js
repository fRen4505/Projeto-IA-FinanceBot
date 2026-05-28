import * as fs from 'fs/promises';

export async function Process(file) {

    try {
        if (file.includes('.csv')) {
            const procesInput = []
            const qRegex = /^"|"$/g;
            
            const infos = await fs.readFile(file, 'utf8')
            const lines = infos.split('\n')

            const heads = lines.shift().trim().split(',')

            const headStack = []
            heads.forEach( (h) => {
                headStack.push(h.trim().replace(qRegex, ''))
            })
                
            lines.forEach( (l) => {
                const values = l.trim().split(',')

                const valStack = []
                values.forEach( (v) => {
                    valStack.push(v.trim().replace(qRegex, ''))
                })
            
                let dataObj = {} 
                let p = 0
                while (p < headStack.length) {
                    dataObj[headStack[p]] = valStack[p]
                    p++;
                }

                procesInput.push(dataObj)
            })

            await fs.unlink(file)
            return procesInput;
        }
        else{ throw new Error(`non .csv`); }
    } catch (error) {
        throw new Error(`read err`);
    }
}

export function getTime() {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 13) {
        return 'Bom dia'
    }if (hour >= 13 && hour < 19) {
        return 'Boa tarde'
    }else{
        return 'Boa noite'
    }
}
