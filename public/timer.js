let lastUpdateTime

socket.on('auctionUpdate', () => {
    updateTimer()
})

function updateTimer() {
    const until = document.getElementById("update");
    let diff = 60
    const interval = setInterval(async () => {
        if (diff >= 0 && diff <= 60) {
            until.innerText = `${diff} seconds until update`;
        }

        if (diff <= -1) {
            clearInterval(interval)
        }
        diff--
    }, 1000);

    socket.once('updateSoon', () => {
        clearInterval(interval)
        until.innerText = `Auction updating soon...`;
    })
}
