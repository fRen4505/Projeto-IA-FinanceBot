import * as fs from 'fs/promises';

export async function Process(file) {

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

export function getTime() {
    
    const hour = new Date().getHours();
    const time = new Date().toLocaleTimeString()

    if (hour >= 0 && hour <= 6) {
        if (time.includes('AM')) {
            return 'Boa noite'
        }
        if (time.includes('PM')) {
            return 'Boa tarde'
        }
    }
    if (hour >= 6 && hour <= 12) {
        if (time.includes('AM')) {
            return 'Bom dia'
        }
        if (time.includes('PM')) {
            return 'Boa noite'
        }    
    }

}
