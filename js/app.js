'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'
var isGlue = false

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/candy.png">'

// Model:
var gBoard
var gGamerPos
var gInterval
var gBallCollected = 0
var gBallExist = 2

function onInitGame() {
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    gInterval = setInterval(addBall, 4700)
    gInterval = setInterval(addGlue, 5000)
}

function addBall() {
    var emptyCells = getEmptyCells()
    var idx = getRandomIntInclusive(0, emptyCells.length)
    var emptyCell = emptyCells.splice(idx, 1)[0]
    gBoard[emptyCell.i][emptyCell.j].gameElement = BALL
    renderCell(emptyCell, BALL_IMG)
    checkVictory()
    gBallExist++
}

function addGlue() {
    var emptyCells = getEmptyCells()
    var idx = getRandomIntInclusive(0, emptyCells.length)
    var emptyCell = emptyCells.splice(idx, 1)[0]
    gBoard[emptyCell.i][emptyCell.j].gameElement = GLUE
    renderCell(emptyCell, GLUE_IMG)
    checkVictory()
    setTimeout(() => {
        gBoard[emptyCell.i][emptyCell.j].gameElement = FLOOR
        renderCell(emptyCell, null)
    }, 3000); 
}

// console.log('gBoard', gBoard);
function buildBoard() {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < 10; i++) {
        board[i] = []
        for (var j = 0; j < 12; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === 9 || j === 0 || j === 11) {
                board[i][j].type = WALL

            }
        }
    }
    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL

    board[0][5].type = FLOOR
    board[5][0].type = FLOOR
    board[5][11].type = FLOOR
    board[9][5].type = FLOOR
    // console.log(board)
    return board
}

// Render the board to an HTML table
function renderBoard(board) {

    const elBoard = document.querySelector('.board')
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })
            // console.log('cellClass:', cellClass)

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }
            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
    if (isGlue) return

    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)

    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
        if (j === -1) j = 11
        else if (j === 12) j = 0
        else if (i === -1) i = 9
        else if (i === 10) i = 0
        var targetCell = gBoard[i][j]
        if (targetCell.type === WALL) return

        if (targetCell.gameElement === BALL) {
            gBallCollected++
            var sound = new Audio('EatSound.wav')
            sound.play()
            const elHeader = document.querySelector('h1 span')
            elHeader.innerText = gBallCollected
        }
        if (targetCell.gameElement === GLUE) {
            isGlue = true
            setTimeout(() => {
                isGlue = false
            }, 3000);
        }

        // update Model
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // update DOM
        renderCell(gGamerPos, '')

        // ADD TO
        // update Model
        targetCell.gameElement = GAMER
        gGamerPos = { i, j }
        // update DOM
        renderCell(gGamerPos, GAMER_IMG)
        countNegs()
    }
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    // console.log('location', location);

    const cellSelector = '.' + getClassName(location) // .cell-i-j
    const elCell = document.querySelector(cellSelector)

    elCell.innerHTML = value

}

// Move the player by keyboard arrows
function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j
    console.log('event.key:', event.key)

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function getEmptyCells() {
    const emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.type === WALL) continue
            if (!currCell.gameElement) {
                emptyCells.push({ i, j })
            }
        }
    }
    return emptyCells
}

function checkVictory() {
    const elWinning = document.querySelector('.winning-message')
    if (gBallExist === gBallCollected) {
        clearInterval(gInterval)
        elWinning.style.display = 'flex'
    }
}

function restartButton() {
    const elWinning = document.querySelector('.winning-message')
    elWinning.style.display = 'none'
    gBallCollected = 0
    gBallExist = 2
    onInitGame()
}

function countNegs() {
    var elHeaderThree = document.querySelector('h3 span')
    var negsCount = 0
    for (var i = gGamerPos.i - 1; i <= gGamerPos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = gGamerPos.j - 1; j <= gGamerPos.j + 1; j++) {
            if (i === gGamerPos.i && j === gGamerPos.j) continue
            if (j < 0 || j >= gBoard[i].length) continue
            if (gBoard[i][j].gameElement === BALL) negsCount++
        }
    }
    elHeaderThree.innerText = + negsCount
    return negsCount
}

