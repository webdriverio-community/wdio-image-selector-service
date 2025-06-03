interface Position {
    x: number;
    y: number;
}

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const avocadoImg = new Image();
const trapImg = new Image();

avocadoImg.src = 'assets/avocado.png';
trapImg.src = 'assets/trap.png';

let avocados: Position[] = [];
let traps: Position[] = [];
let score = 0;

function randomPosition(): Position {
    const x = Math.random() * (canvas.width - 50);
    const y = Math.random() * (canvas.height - 50);
    return {x, y};
}

function updateScoreDisplay() {
    const scoreDiv = document.getElementById('scoreDisplay');
    if (scoreDiv) {
        scoreDiv.textContent = `Score: ${score}`;
    }
}

function drawGame(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    avocados = [];
    traps = [];

    for (let i = 0; i < 3; i++) {
        const pos = randomPosition();
        avocados.push(pos);
        ctx.drawImage(avocadoImg, pos.x, pos.y, 50, 50);
    }

    for (let i = 0; i < 2; i++) {
        const pos = randomPosition();
        traps.push(pos);
        ctx.drawImage(trapImg, pos.x, pos.y, 50, 50);
    }

    ctx.fillStyle = '#333';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);

    updateScoreDisplay();
}

canvas.addEventListener('click', (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let hit = false;

    avocados.forEach(pos => {
        if (
            clickX >= pos.x && clickX <= pos.x + 50 &&
            clickY >= pos.y && clickY <= pos.y + 50
        ) {
            score++;
            hit = true;
        }
    });

    traps.forEach(pos => {
        if (
            clickX >= pos.x && clickX <= pos.x + 50 &&
            clickY >= pos.y && clickY <= pos.y + 50
        ) {
            score = score - 10;
            hit = true;
        }
    });

    if (hit) {
        drawGame();
    }
});

avocadoImg.onload = () => {
    trapImg.onload = drawGame;
};

setInterval(drawGame, 100000); // Redraw every 100 sec
