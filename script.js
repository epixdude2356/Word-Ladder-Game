let currentLevel = 0;
let score = 0;
let timer = null; // Variable for the timer
let startTime = null; // Variable for the start time
let misses = 0; // Variable for the number of incorrect guesses
let finalScore = 0; // Variable for the final score after multipliers
let currentDate = new Date();
document.getElementById('current-date').textContent = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

let statsButton = document.getElementById('stats-button');

let levels = [
    { word: 'RAGE', hint: 'Trapped in a ___' },
    { word: 'CAGE', hint: 'Helps you to walk' },
    { word: 'CANE', hint: 'Helps to direct traffic' },
    { word: 'CONE', hint: 'Refers to pitch or emotion of voice' },
    { word: 'TONE', hint: 'Unit of measurement' },
    { word: 'TONS', hint: 'Level Complete' },
];



document.getElementById('instructions-bg-color-toggle').addEventListener('click', function() {
    let body = document.body;
    if (body.style.backgroundColor === 'white' && body.style.color === 'black') {
        body.style.backgroundColor = 'black';
        body.style.color = 'white';
        localStorage.setItem('theme', 'dark');  // Save theme to localStorage
    } else {
        body.style.backgroundColor = 'white';
        body.style.color = 'black';
        localStorage.setItem('theme', 'light');  // Save theme to localStorage
    }
});



function updateWordAndHint() {
    let level = levels[currentLevel];
    updateWordGrid();
    document.getElementById('hint').textContent = 'Hint: ' + level.hint;
}


function updateWordGrid() {
    let wordGrid = document.getElementById('word-grid');
    wordGrid.innerHTML = ''; // Clear the word grid


    // Create the word grid
    for (let i = 0; i <= currentLevel; i++) { // Only go up to currentLevel
        let row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < 4; j++) {
            let cell = document.createElement('div');
            cell.className = 'cell';
            if (i <= currentLevel) {  // Add the "correct" class to completed levels and the current level
                cell.classList.add('correct');
            }
            if (i < levels.length) {
                cell.textContent = levels[i].word[j] || '';
            }
            row.appendChild(cell);
        }
        wordGrid.appendChild(row);
    }


// Create the row for the input fields
let inputRow = document.createElement('div');
inputRow.className = 'row';
for (let j = 0; j < 4; j++) {
    let cell = document.createElement('input');
    cell.type = 'text';
    cell.className = `guess-cell row-${currentLevel+1}`;  // Add the row number to the class name
    cell.maxLength = '1';
    inputRow.appendChild(cell);
}
wordGrid.appendChild(inputRow); // Append the row to the word grid


// Update the guessCells variable and add the event listeners
guessCells = Array.from(document.getElementsByClassName('guess-cell'));
guessCells.forEach(function(cell, index) {
    cell.addEventListener('input', function() {
        if (index < guessCells.length - 1) {
            guessCells[index + 1].focus();
        }
    });
    cell.addEventListener('keydown', function(e) {
        if (e.keyCode === 8 && index > 0 && this.value === '') {
            setTimeout(() => guessCells[index - 1].focus(), 0);
        }
    });
   
    cell.addEventListener('keypress', function(e) {
        if (e.keyCode === 13) {
            document.getElementById('submit-guess').click();
        }
    });
});
}




// Function to update the timer display
function updateTimer() {
    let now = Date.now();
    let timeDiff = now - startTime; // Time difference in milliseconds


    // Convert the time difference to minutes, seconds, and hundredths of seconds
    let minutes = Math.floor(timeDiff / 60000);
    let seconds = Math.floor((timeDiff % 60000) / 1000);
    let hundredths = Math.floor((timeDiff % 1000) / 10);


    // Format the time components with leading zeros if necessary
    let minutesStr = String(minutes).padStart(2, '0');
    let secondsStr = String(seconds).padStart(2, '0');
    let hundredthsStr = String(hundredths).padStart(2, '0');


    // Update the timer display
    document.getElementById('timer').textContent = `${minutesStr}:${secondsStr}.${hundredthsStr}`;
}




function isOneLetterDifferent(word1, word2) {
    word1 = word1.toLowerCase();
    word2 = word2.toLowerCase();
    let diffCount = 0;
    for (let i = 0; i < word1.length; i++) {
        if (word1[i] !== word2[i]) {
            diffCount++;
        }
    }
    return diffCount === 1;
}


document.getElementById('submit-guess').addEventListener('click', function() {
    if (!timer) {
        return;
    }
    
    let guess = guessCells.map(cell => cell.value.toUpperCase()).join('');
    if (isOneLetterDifferent(guess, levels[currentLevel].word) && guess === levels[currentLevel+1].word.toUpperCase()) {
        score++;
        document.getElementById('score').textContent = 'Score: ' + score;
        
        if (score === 5) {
            clearInterval(timer);
            document.getElementById('submit-guess').disabled = true;
        
            let timeInSeconds = (Date.now() - startTime) / 1000; // Convert milliseconds to seconds
            finalScore = timeInSeconds * (10 + misses); // Calculate final score
            finalScore = Math.round(finalScore); // Round to the nearest whole number

        
            // Show the end screen
            showEndScreen(timeInSeconds + 's', (10 + misses), finalScore);
        
            // Disable the input fields
            guessCells.forEach(cell => cell.disabled = true);
        
            return;
        }        
        

        document.getElementById('message').textContent = 'Correct!';
        currentLevel++;
        if (currentLevel < levels.length) {
            updateWordAndHint();
            let nextGuessCell = document.querySelector(`.guess-cell.row-${currentLevel + 1}`);
            if (nextGuessCell) {
                nextGuessCell.focus();
            }
        } else {
            document.getElementById('message').textContent = 'Congratulations! You completed all levels.';
            clearInterval(timer);
            document.getElementById('submit-guess').disabled = true;
        }
    } else {
        document.getElementById('message').textContent = 'Incorrect, try again.';
        misses++;
        document.getElementById('misses').textContent = 'Misses: ' + misses;
    }
    guessCells.forEach(cell => cell.value = '');
});



// Start button event listener
document.getElementById('start-button').addEventListener('click', function() {
    // Hide the start screen and show the game
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';


    // Set up the first level
    currentLevel = 0;
    updateWordAndHint();


    // Start the timer
    startTime = Date.now();
    timer = setInterval(updateTimer, 10); // Update the timer every 10 milliseconds


    // Focus the first input field
    let firstGuessCell = document.querySelector(`.guess-cell.row-1`);
    if (firstGuessCell) {
        firstGuessCell.focus();
    }
});




document.getElementById('bg-color-toggle').addEventListener('click', function() {
    let body = document.body;
    if (body.style.backgroundColor === 'white' && body.style.color === 'black') {
        body.style.backgroundColor = 'black';
        body.style.color = 'white';
        localStorage.setItem('theme', 'dark');  // Save theme to localStorage
    } else {
        body.style.backgroundColor = 'white';
        body.style.color = 'black';
        localStorage.setItem('theme', 'light');  // Save theme to localStorage
    }
});




// Initialization code
document.getElementById('game-container').style.display = 'none'; // Hide the game initially
updateWordAndHint();



let endScreen;
let closeEndScreen;

function showEndScreen(finalTime, multiplier, finalScore) {
    document.getElementById('endFinalTime').innerText = `Final time: ${finalTime}`;
    document.getElementById('endMisses').innerText = `Misses: ${misses}`; // Display number of misses
    document.getElementById('endFinalScore').innerText = `Final score: ${finalScore}`;
    endScreen.style.display = "block";
    statsButton.style.display = "block"; // Show the stats button
}


statsButton.addEventListener('click', function() {
    endScreen.style.display = "block";
});


window.onload = function() {
    // Theme setting code
    let theme = localStorage.getItem('theme');  // Get theme from localStorage
    let body = document.body;
    if (theme === 'dark') {
        body.style.backgroundColor = 'black';
        body.style.color = 'white';
    } else {
        body.style.backgroundColor = 'white';
        body.style.color = 'black';
    }

    // Other onload code
    endScreen = document.getElementById('endScreen');
    closeEndScreen = document.getElementById('closeEndScreen');

    closeEndScreen.onclick = function() {
        endScreen.style.display = "none";
    }

    // Get a reference to the share button
    let shareTwitter = document.getElementById('shareTwitter');

    document.querySelector('#share-button').addEventListener('click', function() {
        var messageToShare = `I just scored ${finalScore} on today's word ladder, see if you can beat my score! https://www.examplewordladder.com`;  // Replace with your message
    
        if (window.matchMedia('(max-width: 600px)').matches) {
            // The device is a mobile device, so use the Web Share API
            if (navigator.share) {
                navigator.share({
                    title: 'Word Ladder Game',
                    text: messageToShare,
                    url: window.location.href,
                })
                .then(() => console.log('Successful share'))
                .catch((error) => console.log('Error sharing', error));
            } else {
                console.log('Web Share not supported on this browser');
            }
        } else {
            // The device is a desktop device, so use the Clipboard API
            if (navigator.clipboard) {
                navigator.clipboard.writeText(messageToShare)
                .then(() => {
                    console.log('Text copied to clipboard');
    
                    // Show the notification
                    document.getElementById('clipboard-notification').style.display = 'block';

                    // Hide the notification after 3 seconds
                    setTimeout(function() {
                        document.getElementById('clipboard-notification').style.display = 'none';
                    }, 3000);


                    
                })
                .catch((error) => console.log('Error copying text', error));
            } else {
                console.log('Clipboard API not supported on this browser');
            }
        }
    });
}

