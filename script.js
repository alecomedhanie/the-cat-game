const cat = document.getElementById('cat');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const pauseButton = document.getElementById('pause-button');
const timeDisplay = document.getElementById('time');
const levelDisplay = document.getElementById('level');
const highScoreDisplay = document.getElementById('high-score');

if (cat && scoreDisplay && timeDisplay && levelDisplay && highScoreDisplay && startButton && stopButton && pauseButton) {
    let score = 0;
    let level = 1;
    let catSpeed = 1000;
    let isPlaying = false;
    let isPaused = false;
    let gameInterval;
    let gameTimeout;
    const gameDuration = 30000; // 30 seconds
    let currentPowerUp = null;
    let powerUpTimeout;
    let remainingTime;
    let startTime;
    let timerInterval;
    let highScore = Number(localStorage.getItem('highScore')) || 0;
    highScoreDisplay.textContent = highScore;

    startButton.addEventListener('click', startGame);
    stopButton.addEventListener('click', stopGame);
    pauseButton.addEventListener('click', togglePauseGame);
    cat.addEventListener('click', debounce(catchCat, 200));
    document.addEventListener('keydown', handleKeyPress);

    function startGame() {
        score = 0;
        level = 1;
        catSpeed = 1000;
        scoreDisplay.textContent = score;
        levelDisplay.textContent = level;
        isPlaying = true;
        isPaused = false;
        cat.style.display = 'block';
        startButton.disabled = true;
        stopButton.disabled = false;
        pauseButton.disabled = false;

        moveCat();
        gameInterval = setInterval(moveCat, catSpeed);
        startTime = Date.now();
        remainingTime = gameDuration;
        timeDisplay.textContent = (remainingTime / 1000).toFixed(1);
        timerInterval = setInterval(updateTimer, 100);
        gameTimeout = setTimeout(endGame, remainingTime);
        spawnPowerUp();
    }

    function stopGame() {
        if (isPlaying) {
            clearTimeout(gameTimeout);
            clearTimeout(powerUpTimeout);
            endGame();
        }
    }

    function togglePauseGame() {
        if (isPlaying) {
            if (isPaused) {
                // Resume game
                isPaused = false;
                pauseButton.textContent = 'Pause Game';
                startTime = Date.now();
                gameTimeout = setTimeout(endGame, remainingTime);
                gameInterval = setInterval(moveCat, catSpeed);
                timerInterval = setInterval(updateTimer, 100);
                spawnPowerUp();
            } else {
                // Pause game
                isPaused = true;
                pauseButton.textContent = 'Resume Game';
                clearInterval(gameInterval);
                clearTimeout(gameTimeout);
                clearTimeout(powerUpTimeout);
                clearInterval(timerInterval);
                remainingTime -= Date.now() - startTime;
            }
        }
    }

    function catchCat() {
        if (isPlaying && !isPaused) {
            score += (currentPowerUp === 'doublePoints') ? 2 : 1;
            scoreDisplay.textContent = score;
            updateLevel();
            moveCat();
        }
    }

    function endGame() {
        isPlaying = false;
        isPaused = false;
        clearInterval(gameInterval);
        clearTimeout(gameTimeout);
        clearTimeout(powerUpTimeout);
        clearInterval(timerInterval);
        cat.style.display = 'none';
        startButton.disabled = false;
        stopButton.disabled = true;
        pauseButton.disabled = true;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreDisplay.textContent = highScore;
        }
        alert(`Game over! Your score is ${score}`);
    }

    function moveCat() {
        if (!isPaused) {
            requestAnimationFrame(() => {
                if (currentPowerUp === 'freeze') {
                    cat.style.left = `${lastPosition.x}px`;
                    cat.style.top = `${lastPosition.y}px`;
                } else {
                    const speed = (currentPowerUp === 'slowDown') ? 0.5 : 1;
                    const x = Math.random() * (window.innerWidth - cat.offsetWidth) * speed;
                    const y = Math.random() * (window.innerHeight - cat.offsetHeight) * speed;
                    cat.style.left = `${x}px`;
                    cat.style.top = `${y}px`;
                    lastPosition = { x, y };
                }
            });
        }
    }

    function handleKeyPress(event) {
        if (event.code === 'Space') {
            if (!isPlaying) {
                startGame();
            } else {
                catchCat();
            }
        } else if (event.code === 'Escape') {
            stopGame();
        } else if (event.code === 'KeyP') {
            togglePauseGame();
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    function updateTimer() {
        const timeLeft = Math.max(remainingTime - (Date.now() - startTime), 0);
        timeDisplay.textContent = (timeLeft / 1000).toFixed(1);
    }

    function updateLevel() {
        const newLevel = Math.floor(score / 10) + 1;
        if (newLevel !== level) {
            level = newLevel;
            levelDisplay.textContent = level;
            catSpeed = Math.max(1000 - (level - 1) * 100, 300);
            clearInterval(gameInterval);
            gameInterval = setInterval(moveCat, catSpeed);
        }
    }

    function spawnPowerUp() {
        const powerUps = ['slowDown', 'doublePoints', 'freeze'];
        const randomPowerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
        currentPowerUp = randomPowerUp;
        
        // Visual indication of power-up 
        cat.style.border = '8px solid orange';
        
        // Power-up duration
        setTimeout(() => {
            currentPowerUp = null;
            cat.style.border = 'none';
        }, 5000);

        // Schedule next power-up
        powerUpTimeout = setTimeout(spawnPowerUp, Math.random() * 10000 + 5000);
    }

    let lastPosition = { x: 0, y: 0 };
} else {
    if (!cat) console.error('Cat element not found');
    if (!scoreDisplay) console.error('Score display element not found');
    if (!timeDisplay) console.error('Time display element not found');
    if (!levelDisplay) console.error('Level display element not found');
    if (!highScoreDisplay) console.error('High score display element not found');
    if (!startButton) console.error('Start button not found');
    if (!stopButton) console.error('Stop button not found');
    if (!pauseButton) console.error('Pause button not found');
}
