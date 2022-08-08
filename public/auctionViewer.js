function updateAuctions(auctionsArray) {
    const aucViewer = document.getElementById("auction-viewer")
    aucViewer.innerHTML = ``
    for (const {name, lore, id} of auctionsArray) {
        const el = document.createElement('li');
        let newName = replaceColorCodes(name);
        newName.style.fontFamily = 'minecraft';
        newName.style.textAlign = 'left';
        el.append(newName);
        let newLore = replaceColorCodes(lore);
        newLore.style.textAlign = 'left';
        el.append(newLore);
        el.classList.add("auctionItem");
        el.classList.add("mcText");
        aucViewer.appendChild(el);
        aucViewer.scrollLeft = document.getElementById("auction-viewer").scrollHeight;
    }
}

socket.on('auctionsData', (data) => {
    updateAuctions(data)
})

let obfuscators = []
const styleMap = {
    '§4': 'font-weight: normal; text-decoration: none; color: #be0000; font-family: minecraft; text-align: left',
    '§c': 'font-weight: normal; text-decoration: none; color: #fe3f3f; font-family: minecraft; text-align: left',
    '§6': 'font-weight: normal; text-decoration: none; color: #d9a334; font-family: minecraft; text-align: left',
    '§e': 'font-weight: normal; text-decoration: none; color: #fefe3f; font-family: minecraft; text-align: left',
    '§2': 'font-weight: normal; text-decoration: none; color: #00be00; font-family: minecraft; text-align: left',
    '§a': 'font-weight: normal; text-decoration: none; color: #3ffe3f; font-family: minecraft; text-align: left',
    '§b': 'font-weight: normal; text-decoration: none; color: #3ffefe; font-family: minecraft; text-align: left',
    '§3': 'font-weight: normal; text-decoration: none; color: #00bebe; font-family: minecraft; text-align: left',
    '§1': 'font-weight: normal; text-decoration: none; color: #0000be; font-family: minecraft; text-align: left',
    '§9': 'font-weight: normal; text-decoration: none; color: #3f3ffe; font-family: minecraft; text-align: left',
    '§d': 'font-weight: normal; text-decoration: none; color: #fe3ffe; font-family: minecraft; text-align: left',
    '§5': 'font-weight: normal; text-decoration: none; color: #be00be; font-family: minecraft; text-align: left',
    '§f': 'font-weight: normal; text-decoration: none; color: #ffffff; font-family: minecraft; text-align: left',
    '§7': 'font-weight: normal; text-decoration: none; color: #bebebe; font-family: minecraft; text-align: left',
    '§8': 'font-weight: normal; text-decoration: none; color: #3f3f3f; font-family: minecraft; text-align: left',
    '§0': 'font-weight: normal; text-decoration: none; color: #000000; font-family: minecraft; text-align: left',
    '§l': 'font-weight: bold; font-family: minecraft; text-align: left',
    '§n': 'text-decoration: underline; text-decoration-skip: spaces; font-family: minecraft; text-align: left',
    '§o': 'font-style: italic; font-family: minecraft; text-align: left',
    '§m': 'text-decoration: line-through; text-decoration-skip: spaces; font-family: minecraft; text-align: left',
}

function obfuscate(string, elem) {
    let magicSpan
    let currNode
    let len = elem.childNodes.length
    if (string.indexOf('<br>') > -1) {
        elem.innerHTML = string
        for (let j = 0; j < len; j++) {
            currNode = elem.childNodes[j]
            if (currNode.nodeType === 3) {
                magicSpan = document.createElement('span')
                magicSpan.innerHTML = currNode.nodeValue
                elem.replaceChild(magicSpan, currNode)
                init(magicSpan)
            }
        }
    } else {
        init(elem, string)
    }

    function init(el, str) {
        let i = 0
        let obsStr = str ?? el.innerHTML
        let len = obsStr.length
        obfuscators.push(() => {
            if (i >= len) i = 0
            obsStr = replaceRand(obsStr, i)
            el.innerHTML = obsStr
            i++
        })
    }

    function randNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    function replaceRand(string, i) {
        let randChar = String.fromCharCode(randNum(64, 90))
        return string.substr(0, i) + randChar + string.substr(i + 1, string.length)
    }
}

function applyCode(string, codes) {
    let len = codes.length
    let elem = document.createElement('span')
    let obfuscated = false
    for (let i = 0; i < len; i++) {
        elem.style.cssText += styleMap[codes[i]] + ';'
        if (codes[i] === '§k') {
            obfuscate(string, elem)
            obfuscated = true
        }
    }

    if (!obfuscated) elem.innerHTML = string
    return elem
}

function parseStyle(string) {
    let codes = string.match(/§.{1}/g) || []
    let indexes = []
    let apply = []
    let tmpStr
    let indexDelta
    let final = document.createElement('div')
    let len = codes.length
    string = string.replace(/\n|\\n/g, '<br>')

    for (let i = 0; i < len; i++) {
        indexes.push(string.indexOf(codes[i]))
        string = string.replace(codes[i], '\x00\x00')
    }

    if (indexes[0] !== 0) final.appendChild(applyCode(string.substring(0, indexes[0]), []))
    for (let i = 0; i < len; i++) {
        indexDelta = indexes[i + 1] - indexes[i]
        if (indexDelta === 2) {
            while (indexDelta === 2) {
                apply.push(codes[i])
                i++
                indexDelta = indexes[i + 1] - indexes[i]
            }

            apply.push(codes[i])
        } else {
            apply.push(codes[i])
        }

        if (apply.lastIndexOf('§r') > -1) apply = apply.slice(apply.lastIndexOf('§r') + 1)
        tmpStr = string.substring(indexes[i], indexes[i + 1])
        final.appendChild(applyCode(tmpStr, apply))
    }

    return final
}

function clearObfuscators() {
    obfuscators = []
}

function replaceColorCodes(phrase) {
    clearObfuscators()
    return parseStyle(String(phrase))
}

function strRemoveColorCodes(str) {
    return str.replace(/§./g, '')
}
