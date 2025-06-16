const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const playerScreen = document.getElementById("player-screen");
const intro = document.getElementById("intro");
const track = document.getElementById("track");
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");
const closeBtn = document.getElementById("close-btn");
const pauseBtn = document.getElementById("pause-btn");

startBtn.onclick = () => {
  intro.pause();
  startScreen.classList.add("hidden");
  playerScreen.classList.remove("hidden");
  track.play();
  setupVisualizer();
};

closeBtn.onclick = () => {
  track.pause();
  track.currentTime = 0;
  location.reload();
};

pauseBtn.onclick = () => {
  if (track.paused) {
    track.play();
    pauseBtn.textContent = "⏸";
  } else {
    track.pause();
    pauseBtn.textContent = "▶️";
  }
};

function setupVisualizer() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(track);
  const analyser = audioCtx.createAnalyser();
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 256;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  let mode = 0;
  setInterval(() => {
    mode = (mode + 1) % 3; // 3 режима
  }, 6000);

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mode === 0) {
      // Столбики
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        const r = 200 + (barHeight % 55);
        const g = 50 + (i % 100);
        const b = 150 + (barHeight % 100);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    } else if (mode === 1) {
      // Круги
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      for (let i = 0; i < bufferLength; i += 8) {
        const radius = dataArray[i] * 0.8;
        const angle = i * (Math.PI / 32);
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${i * 5}, 100%, 50%)`;
        ctx.fill();
      }
    } else {
      // Линия
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      for (let i = 0; i < bufferLength; i++) {
        const y = (dataArray[i] / 255.0) * canvas.height;
        ctx.lineTo(i * (canvas.width / bufferLength), y);
      }
      ctx.strokeStyle = 'cyan';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  draw();
}
