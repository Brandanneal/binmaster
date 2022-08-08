swap('in-game-chat')

function swap (page) {
    const tabContents = document.getElementsByClassName('tabcontent')
    for (const tabContent of tabContents) {
        tabContent.hidden = true
        tabContent.style.display = 'none'
    }

    const toShow = document.getElementById(page)
    toShow.hidden = false
    toShow.style.display = ''

    selectTab(`${page}-button`)
}

function selectTab (tab) {
    const tabsToDeselect = document.getElementsByClassName('tab')
    for (const tabToDeselect of tabsToDeselect) {
        tabToDeselect.classList.remove('selected-tab')
    }

    console.log(tab)
    const tabButtonToSelect = document.getElementById(tab)
    tabButtonToSelect.classList.add('selected-tab')
}
