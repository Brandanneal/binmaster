const socket = io()
const time = document.getElementById('time')
const mcBtn = document.getElementById('mc-form')
const mcInput = document.getElementById('mc-input')
const cvBtn = document.getElementById('console-form')
const cvInput = document.getElementById('console-input')
const messages = document.getElementById('messages')
const c = document.getElementById('console')
const stats = document.getElementById('stats')
const botInfo = document.getElementById('bot-info')
const cv = document.getElementById('console-viewer')
const consoleMessages = document.getElementById('console-messages')

// Pad to 2 or 3 digits, default is 2
function pad(n, z) {
    z = z || 2;
    return ('00' + n).slice(-z);
}

function msToTime(s) {
    const ms = s % 1000;
    s = (s - ms) / 1000;
    const secs = s % 60;
    s = (s - secs) / 60;
    const mins = s % 60;
    const hrs = (s - mins) / 60;

    return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
}

function intToString(num) {
    if (num > 999 && num < 1000000) {
        return (num / 1000).toFixed(1) + 'K';
    } else if (num > 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    } else if (num > 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num < 900) {
        return num;
    }
}

mcBtn.addEventListener('submit', (event) => {
    event.preventDefault()
    if (!mcInput.value) return
    socket.emit('msg', mcInput.value)
    mcInput.value = ''
})

cvBtn.addEventListener('submit', (event) => {
    event.preventDefault()
    if (!cvInput.value) return
    socket.emit('consoleMsg', cvInput.value)
    cvInput.value = ''
})

function sendCommand(command) {
    socket.emit('consoleMsg', command)
}

socket.on('elapsed', (msg) => {
    time.innerHTML = msToTime(msg);
})

socket.on('message', (msg) => {
    const el = document.createElement('div')
    el.innerHTML = msg
    el.classList.add('msg');
    messages.appendChild(el)
    messages.scrollTop = messages.scrollHeight
})

socket.on('stats', (msg) => {
    const {estimate, activeAuctions, state, purse, auctionValue} = msg
    stats.innerHTML = `
            purse balance: ${intToString(purse)} coins
            <br>
            purse after sold: ${intToString(auctionValue)} coins
            <br>
            estimated profit: ${intToString(estimate)} coins
            <br>
            active auctions: ${activeAuctions}
            <br>
            state: ${state}
`
})

socket.on('botinfo', (data) => {
    updateInfo(data)
})

socket.on('consoleViewer', (msg) => {
    const el = document.createElement('div');
    el.innerHTML = msg;
    el.classList.add('console-msg');
    consoleMessages.appendChild(el);
    consoleMessages.scrollTop = consoleMessages.scrollHeight;
})

let cachedRes

window.onload = async () => {
    const res = await getConfig()
    cachedRes = res.server.botInfo
    updateInfo(res.server.botInfo)
}

window.addEventListener('resize', () => {
    updateInfo(cachedRes)
});

function updateInfo(data) {
    const {ign, img} = data
    if (window.innerWidth > 450) {
        botInfo.innerHTML = `
            <h3>
            IGN: ${ign}
</h3>
<img src="${img}">
`
    } else {
        botInfo.innerHTML = `<img src="${img}">`
    }
}

async function getConfig() {
    return JSON.parse(await (await fetch('/config')).text())
}
