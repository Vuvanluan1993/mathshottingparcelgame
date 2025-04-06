<canvas id="gameCanvas" width="800" height="400"></canvas>
<script>
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- INPUT ---
const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === ' ') {
    bullets.push({
      x: player.x + player.width,
      y: player.y + player.height / 2 - 8,
      width: 16,
      height: 16,
      speed: 5
    });
  }
});
document.addEventListener('keyup', e => keys[e.key] = false);

// --- PLAYER ---
const player = {
  x: 100,
  y: 260,
  width: 32,
  height: 32,
  speedY: 0,
  maxSpeed: 3,
  acceleration: 0.2,
  friction: 0.1
};
const playerImg = new Image();
playerImg.src = 'player.png';

// --- BACKGROUND ---
const bg = {
  x: 0,
  speed: 1,
  image: new Image()
};
bg.image.src = 'background.png';

// --- BULLETS ---
const bullets = [];
const bulletImg = new Image();
bulletImg.src = 'bullet.png';

// --- PARCELS ---
const parcels = [];
const parcelImg = new Image();
parcelImg.src = 'parcel.png';

function generateAddition() {
  const a = Math.floor(Math.random() * 6);
  const b = Math.floor(Math.random() * 6);
  const isCorrect = Math.random() < 0.7;
  let result = a + b;
  if (!isCorrect) {
    let wrong;
    do {
      wrong = Math.floor(Math.random() * 11);
    } while (wrong === result);
    result = wrong;
  }
  return {
    text: `${a} + ${b} = ${result}`,
    correct: (a + b === result)
  };
}

// Tạo thùng định kỳ
setInterval(() => {
  const { text, correct } = generateAddition();
  parcels.push({
    x: canvas.width,
    y: Math.random() * (canvas.height - 40),
    width: 64,
    height: 40,
    speed: 2,
    text: text,
    correct: correct
  });
}, 2000);

// --- GAME STATE ---
let isGameOver = false;

// --- UPDATE ---
function update() {
  // Nền
  bg.x -= bg.speed;
  if (bg.x <= -canvas.width) bg.x = 0;

  // Di chuyển player (chỉ lên/xuống + quán tính)
  if (keys['ArrowUp']) {
    player.speedY -= player.acceleration;
  } else if (keys['ArrowDown']) {
    player.speedY += player.acceleration;
  } else {
    if (player.speedY > 0) {
      player.speedY -= player.friction;
      if (player.speedY < 0) player.speedY = 0;
    } else if (player.speedY < 0) {
      player.speedY += player.friction;
      if (player.speedY > 0) player.speedY = 0;
    }
  }

  if (player.speedY > player.maxSpeed) player.speedY = player.maxSpeed;
  if (player.speedY < -player.maxSpeed) player.speedY = -player.maxSpeed;

  player.y += player.speedY;

  // Giữ player trong màn hình
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
  }

  // Đạn
  bullets.forEach(bullet => bullet.x += bullet.speed);
  for (let i = bullets.length - 1; i >= 0; i--) {
    if (bullets[i].x > canvas.width) bullets.splice(i, 1);
  }

  // Thùng
  for (let i = parcels.length - 1; i >= 0; i--) {
    const parcel = parcels[i];
    parcel.x -= parcel.speed;

    // Va chạm đạn
    for (let j = bullets.length - 1; j >= 0; j--) {
      const bullet = bullets[j];
      const hit = bullet.x < parcel.x + parcel.width &&
                  bullet.x + bullet.width > parcel.x &&
                  bullet.y < parcel.y + parcel.height &&
                  bullet.y + bullet.height > parcel.y;
      if (hit) {
        parcels.splice(i, 1);
        bullets.splice(j, 1);
        break;
      }
    }

    // Nếu là sai và chạm mép trái => GAME OVER
    if (!parcel.correct && parcel.x <= 0) {
      isGameOver = true;
    }
  }
}

// --- DRAW ---
function draw() {
  // Nền
  ctx.drawImage(bg.image, bg.x, 0, canvas.width, canvas.height);
  ctx.drawImage(bg.image, bg.x + canvas.width, 0, canvas.width, canvas.height);

  // Player
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

  // Đạn
  bullets.forEach(bullet => {
    ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
  });

  // Thùng
  parcels.forEach(parcel => {
    ctx.drawImage(parcelImg, parcel.x, parcel.y, parcel.width, parcel.height);

    ctx.fillStyle = 'black';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(parcel.text, parcel.x + parcel.width / 2, parcel.y + parcel.height / 2 + 4);
  });
}

// --- GAME LOOP ---
function loop() {
  if (isGameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '48px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
</script>
