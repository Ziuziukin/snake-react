class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.restartBtn = document.getElementById('restartBtn');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        
        // Игровые параметры
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.food = this.generateFood();
        this.score = 0;
        this.gameRunning = false;
        this.gameOver = false;
        
        this.loadHighScore();
        this.updateScore();
        this.hideGameOver();
    }
    
    setupEventListeners() {
        // Управление клавиатурой
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning && !this.gameOver) {
                this.startGame();
            }
            this.handleKeyPress(e);
        });
        
        // Кнопки
        this.restartBtn.addEventListener('click', () => {
            this.restart();
        });
        
        this.playAgainBtn.addEventListener('click', () => {
            this.restart();
        });
        
        // Автозапуск через 2 секунды
        setTimeout(() => {
            if (!this.gameRunning) {
                this.startGame();
            }
        }, 2000);
    }
    
    startGame() {
        if (this.gameOver) return;
        
        this.gameRunning = true;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gameOver) return;
        
        setTimeout(() => {
            this.update();
            this.draw();
            this.gameLoop();
        }, 150);
    }
    
    handleKeyPress(e) {
        if (this.gameOver) return;
        
        const key = e.key.toLowerCase();
        
        // Предотвращаем движение в противоположном направлении
        switch (key) {
            case 'arrowup':
            case 'w':
                if (this.direction.y === 0) {
                    this.direction = { x: 0, y: -1 };
                }
                break;
            case 'arrowdown':
            case 's':
                if (this.direction.y === 0) {
                    this.direction = { x: 0, y: 1 };
                }
                break;
            case 'arrowleft':
            case 'a':
                if (this.direction.x === 0) {
                    this.direction = { x: -1, y: 0 };
                }
                break;
            case 'arrowright':
            case 'd':
                if (this.direction.x === 0) {
                    this.direction = { x: 1, y: 0 };
                }
                break;
        }
    }
    
    update() {
        if (!this.gameRunning || this.gameOver) return;
        
        // Движение змеи
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Проверка столкновений со стенами
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            this.endGame();
            return;
        }
        
        // Проверка столкновений с телом змеи
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.endGame();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Проверка поедания еды
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        // Очистка канваса
        this.ctx.fillStyle = 'rgba(0, 20, 40, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисование змеи
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Голова змеи
                this.ctx.fillStyle = '#4CAF50';
            } else {
                // Тело змеи
                this.ctx.fillStyle = '#8BC34A';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            // Добавляем блик на голову
            if (index === 0) {
                this.ctx.fillStyle = '#66BB6A';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 3,
                    segment.y * this.gridSize + 3,
                    this.gridSize - 10,
                    this.gridSize - 10
                );
            }
        });
        
        // Рисование еды
        this.ctx.fillStyle = '#F44336';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // Добавляем блик на еду
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2 - 3,
            this.food.y * this.gridSize + this.gridSize / 2 - 3,
            3,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        const highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
        if (this.score > highScore) {
            localStorage.setItem('snakeHighScore', this.score.toString());
            this.highScoreElement.textContent = this.score;
        }
    }
    
    loadHighScore() {
        const highScore = localStorage.getItem('snakeHighScore') || '0';
        this.highScoreElement.textContent = highScore;
    }
    
    endGame() {
        this.gameOver = true;
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.score;
        this.showGameOver();
    }
    
    showGameOver() {
        this.gameOverElement.classList.remove('hidden');
    }
    
    hideGameOver() {
        this.gameOverElement.classList.add('hidden');
    }
    
    restart() {
        this.init();
        this.draw();
    }
}

// Запуск игры
window.addEventListener('load', () => {
    new SnakeGame();
});