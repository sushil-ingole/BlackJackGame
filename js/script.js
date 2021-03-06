let blackjackGame = {
    'you': {
        'scoreSpan': '#your-blackjack-result',
        'div': '#your-box',
        'score': 0
    },
    'dealer': {
        'scoreSpan': '#dealer-blackjack-result',
        'div': '#dealer-box',
        'score': 0
    },
    'cards': ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
    'cardsMap': {
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '10': 10,
        'J': 10,
        'Q': 10,
        'K': 10,
        'A': [1, 11]
    },
    'wins': 0,
    'losses': 0,
    'draws': 0,
    'hitted': false,
    'isStand': false,
    'turnsOver': false,
    'info': false,
    'mute': false,
}

const YOU = blackjackGame['you'];
const DEALER = blackjackGame['dealer'];

const hitSound = new Audio('/sounds/swish.m4a');
const lostSound = new Audio('/sounds/aww.mp3');
const winSound = new Audio('/sounds/cash.mp3');

document.querySelector('#blackjack-hit-button').addEventListener('click', blackjackHit);
document.querySelector('#blackjack-stand-button').addEventListener('click', blackjackStand);
document.querySelector('#blackjack-deal-button').addEventListener('click', blackjackDeal);
document.querySelector('#blackjack-reset-button').addEventListener('click', blackjackReset);
document.querySelector('#blackjack-info-button').addEventListener('click', blackjackInfo);
document.querySelector('#blackjack-mute-button').addEventListener('click', blackjackMute);

function blackjackHit() {
    if (blackjackGame['isStand'] === false) {
        let card = randomCard();
        showCard(card, YOU);
        updateScore(card, YOU);
        showScore(YOU);
    }
    blackjackGame['hitted'] = true;
    console.log("hitted: ", blackjackGame['hitted']);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function blackjackStand() {
    do {

        if (blackjackGame['hitted'] === true && DEALER['score'] <= 15) {

            blackjackGame['isStand'] = true;
            while (DEALER['score'] < 16 && blackjackGame['isStand'] === true) {
                blackjackGame['hitted'] = false;
                let card = randomCard();
                showCard(card, DEALER);
                updateScore(card, DEALER);
                showScore(DEALER);
                await sleep(1000);
            }

            if (DEALER['score'] > 15) {
                blackjackGame['turnsOver'] = true;
                showResult(computeWinner());
            }
            console.log("hitted in stand: ", blackjackGame['hitted']);
            console.log("isStand: ", blackjackGame['isStand']);
        }
    } while (blackjackGame['hitted'] === true);
}

function randomCard() {
    let randomIndex = Math.floor(Math.random() * 13);
    return blackjackGame['cards'][randomIndex];
}

function blackjackDeal() {
    if (blackjackGame['turnsOver'] === true) {

        let yourImages = document.querySelector('#your-box').querySelectorAll('img');
        let dealerImages = document.querySelector('#dealer-box').querySelectorAll('img');
        for (let i = 0; i < yourImages.length; i++) {
            yourImages[i].remove();
        }
        for (let i = 0; i < dealerImages.length; i++) {
            dealerImages[i].remove();
        }

        YOU['score'] = 0;
        DEALER['score'] = 0;

        document.querySelector('#your-blackjack-result').style.color = 'white';
        document.querySelector('#dealer-blackjack-result').style.color = 'white';
        document.querySelector('#your-blackjack-result').textContent = 0;
        document.querySelector('#dealer-blackjack-result').textContent = 0;
        document.querySelector('#blackjack-result').textContent = "Let's play";
        document.querySelector('#blackjack-result').style.color = "black";
        blackjackGame['isStand'] = false;
        blackjackGame['turnsOver'] = false;
        blackjackGame['hitted'] = false;
        console.log("isStand", blackjackGame['isStand']);
        console.log("turnsOver", blackjackGame['turnsOver']);
        console.log("hitted", blackjackGame['hitted']);
    }
}

function showCard(card, activePlayer) {
    if (activePlayer['score'] <= 21) {
        let cardImage = document.createElement('img');
        cardImage.src = `/images/${card}.png`;
        document.querySelector(activePlayer['div']).appendChild(cardImage);
        if (blackjackGame.mute === false) {
            hitSound.play();
        }
    }
}

function updateScore(card, activePlayer) {
    if (card === 'A') {
        // If adding 11 keeps me below 21, add 11. Otherwise add 1. 
        if (activePlayer['score'] + blackjackGame['cardsMap'][card][1] <= 21) {
            activePlayer['score'] += blackjackGame['cardsMap'][card][1];
        } else {
            activePlayer['score'] += blackjackGame['cardsMap'][card][0];
        }
    } else
        activePlayer['score'] += blackjackGame['cardsMap'][card];
}

function showScore(activePlayer) {
    if (activePlayer['score'] <= 21) {
        document.querySelector(activePlayer['scoreSpan']).textContent = activePlayer['score'];
    } else {
        document.querySelector(activePlayer['scoreSpan']).textContent = 'BUST';
        document.querySelector(activePlayer['scoreSpan']).style.color = 'red';
    }
}

function computeWinner() {
    let winner;
    if (YOU['score'] <= 21) {
        if (YOU['score'] > DEALER['score'] || DEALER['score'] > 21) {
            blackjackGame['wins']++;
            winner = YOU;
        } else if (YOU['score'] < DEALER['score']) {
            blackjackGame['losses']++;
            winner = DEALER;
        } else if (YOU['score'] === DEALER['score']) {
            blackjackGame['draws']++;
        }
    } else if (YOU['score'] > 21 && DEALER['score'] <= 21) {
        blackjackGame['losses']++;
        winner = DEALER;
    } else if (YOU['score'] > 21 && DEALER['score'] > 21) {
        blackjackGame['draws']++;
    }

    console.log(blackjackGame);
    return winner;
}

function showResult(activePlayer) {
    let message;
    let messageColor;

    if (activePlayer === YOU) {
        document.querySelector('#wins').textContent = blackjackGame['wins'];
        message = 'You won!';
        messageColor = 'green';
        if (blackjackGame.mute === false) {
            winSound.play();
        }
    } else if (activePlayer === DEALER) {
        document.querySelector('#losses').textContent = blackjackGame['losses'];
        message = 'You lost!';
        messageColor = 'red';
        if (blackjackGame.mute === false) {
            lostSound.play();
        }
    } else {
        document.querySelector('#draws').textContent = blackjackGame['draws'];
        message = 'You drew!';
        messageColor = 'black';
    }

    document.querySelector('#blackjack-result').textContent = message;
    document.querySelector('#blackjack-result').style.color = messageColor;

}

function blackjackReset() {

    let yourImages = document.querySelector('#your-box').querySelectorAll('img');
    let dealerImages = document.querySelector('#dealer-box').querySelectorAll('img');
    for (let i = 0; i < yourImages.length; i++) {
        yourImages[i].remove();
    }
    for (let i = 0; i < dealerImages.length; i++) {
        dealerImages[i].remove();
    }

    YOU['score'] = 0;
    DEALER['score'] = 0;

    document.querySelector('#your-blackjack-result').style.color = 'white';
    document.querySelector('#dealer-blackjack-result').style.color = 'white';
    document.querySelector('#your-blackjack-result').textContent = 0;
    document.querySelector('#dealer-blackjack-result').textContent = 0;
    document.querySelector('#blackjack-result').textContent = "Let's play";
    document.querySelector('#blackjack-result').style.color = "black";
    document.querySelector('#wins').textContent = 0;
    document.querySelector('#losses').textContent = 0;
    document.querySelector('#draws').textContent = 0;
    blackjackGame['isStand'] = false;
    blackjackGame['turnsOver'] = false;
    blackjackGame['hitted'] = false;
    console.log("isStand", blackjackGame['isStand']);
    console.log("turnsOver", blackjackGame['turnsOver']);
    console.log("hitted", blackjackGame['hitted']);
    blackjackGame['wins'] = 0;
    blackjackGame['losses'] = 0;
    blackjackGame['draws'] = 0;
}

function blackjackInfo() {
    if (blackjackGame['info'] === false) {
        document.getElementById('info').style.display = "flex";
        var element1 = document.getElementById('flex-blackjack-row-1-id');
        var element2 = document.getElementById('your-box');
        var element3 = document.getElementById('dealer-box');
        var element4 = document.getElementById('info');
        element1.classList.add('info-display');
        element2.classList.add('info-display');
        element3.classList.add('info-display');
        element4.classList.add('info-display');
        blackjackGame['info'] = true;
        console.log(blackjackGame['info']);
    } else if (blackjackGame['info'] === true) {
        document.getElementById('info').style.display = "none";
        blackjackGame['info'] = false;
        console.log(blackjackGame['info']);
    }
}

function blackjackMute() {
    blackjackGame.mute = !blackjackGame.mute;
    console.log("Mute: " + blackjackGame.mute);
}








































// let blackjackGame = {
//     'you': {'scoreSpan': '#your-blackjack-result', 'div': '#your-box', 'score': 0},
//     'dealer': {'scoreSpan': '#dealer-blackjack-result', 'div': '#dealer-box', 'score': 0},
//     'cards': ['2','3','4','5','6','7','8','9','10','J','Q','K','A'],
// };

// const YOU = blackjackGame['you'];
// const DEALER = blackjackGame['dealer'];

// const hitSound = new Audio('/sounds/swish.m4a')

// document.querySelector('#blackjack-hit-button').addEventListener('click', blackjackHit);
// // document.querySelector('#blackjack-stand-button').addEventListener('click', blackjackStand);
// document.querySelector('#blackjack-deal-button').addEventListener('click', blackjackDeal);

// function blackjackHit() {
//     let card = randomCard();
//     showCard(card, DEALER);
// }

// function randomCard() {
//     let randomIndex = Math.floor(Math.random() * 13);
//     return blackjackGame['cards'][randomIndex];
// }

// function showCard(card, activePlayer) {
//     let cardImage = document.createElement('img');
//     cardImage.src = `/images/${card}.png`;
//     document.querySelector(activePlayer['div']).appendChild(cardImage);
//     hitSound.play();
// }

// function blackjackDeal() {
//     let yourImages = document.querySelector('#your-box').querySelectorAll('img');
//     let dealerImages = document.querySelector('#dealer-box').querySelectorAll('img');

//     for(let i=0; i<yourImages.length; i++) {
//         yourImages[i].remove();
//     }

//     for(let i=0; i<dealerImages.length; i++) {
//         dealerImages[i].remove();
//     }
// }