import * as fs from 'fs/promises';

export async function Process(file) {

    const procesInput = []
    const qRegex = /^"|"$/g;
    
    const infos = await fs.readFile(file, 'utf8')
    const lines = infos.split('\n')

    lines.forEach( (l) => {
        const heads = lines.shift().trim().split(',')
        const values = l.trim().split(',')

        const headStack = []
        heads.forEach( (h) => {
            headStack.push(h.trim().replace(qRegex, ''))
        })
        
        const valStack = []
        values.forEach( (v) => {
            valStack.push(v.trim().replace(qRegex, ''))
        })
       
        let dataObj = {}
        while (valStack.length > 0 && headStack.length > 0) {
            dataObj[headStack.pop()] = valStack.pop()
        }

        procesInput.push(dataObj)
    })

    await fs.unlink(file)

    return procesInput;
}
