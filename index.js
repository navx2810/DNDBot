const Discord = require("discord.js")
const client = new Discord.Client()
const { token } = require("./auth.json")
const log = console.log

if (!token) {
    throw new Error("Make sure you have an auth.json in your root and it contains the 'token' property")
}

client.on('ready', () => {
    log("Listening for commands..")
})

client.on("message", message => {
    if (message.content.startsWith('!')) {
        log(`[COMMAND]: ${message.content}`)
        const params = generateParams(message.content)
        console.log(params)
        switch (params[0].toLowerCase().replace(/^!/, '')) {
            case "r":
            case "roll":
                log("Rolling...")
                const res = RollDie(params[1])
                if(!res) {
                    message.reply(`You made a bad roll with '${params[1] ? params[1] : 'nothing'}'. Please roll again.`)
                } else {
                    message.reply(`Rolled *${res.casts}* = **${res.result}**`)
                    if(res.successes.length) {
                        message.reply(`You rolled **${res.successes.length}** critical *successes!*`)
                    }
                    if(res.fails.length) {
                        message.reply(`You rolled **${res.fails.length}** critical *failures!*`)
                    }
                }
                break
        }
    }
})

function generateParams(content) {
    return content.split(" ")
}

function RollDie(roll) {
    log(`Rolling Dice: ${roll}`)
    // Test successes: (1d8), (1d8+2), (1d8*2), (1d8-2), (1d8+2)*2
    const rgx = /(\d*)d(\d+)([*+-])?(\d+)?/i
    if(rgx.test(roll)) {
        const rolls = rgx.exec(roll).slice(1,5)
        if(rolls && rolls.length) {
            log(`Roll Successful: ${rolls}`)
            let [count, die, operation, addition] = rolls
            if(!count) { count = 1 }
            let casts = []
            let val = 0
            for(let x = 0; x < count; x++) {
                const roll = RollSidedDie(die)
                casts.push( roll )
                val+=roll
            }
            if(operation) {
                val = eval("".concat(val.toString(), operation.toString(), addition.toString()))
            }

            const successes = casts.filter(it => it === 20)
            const fails = casts.filter(it => it === 1)
            casts = casts.join(' + ')
            if(addition) { casts = `${casts} ${operation} ${addition}` }
            return { casts, result: val, successes, fails }
        }
        return 0
    }

    return false
}

function RollSidedDie(die) {
    return Math.ceil(Math.random() * die)
}

client.login(token)