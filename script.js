const mainBtn = document.getElementById("main-button");
const mainScreen = document.getElementById("main-screen");
const visualizerContainer = document.getElementById("visualizer-container");

const intro = document.getElementById("intro");
const track = document.getElementById("track");
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

let audioCtx;
let analyser;
let dataArray;
let bufferLength;
let source;
let step = 0;

mainBtn.onclick = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (step === 0) {
    intro.play();
    mainBtn.textContent = "Готово, запускай!";
    step = 1;
  } else if (step === 1) {
    mainScreen.classList.add("hidden");
    visualizerContainer.classList.remove("hidden");

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    source = audioCtx.createMediaElementSource(track);
    analyser = audioCtx.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;

    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    track.play();
    drawVisualizer();
    step = 2;
  }
};

function drawVisualizer() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    const time = Date.now() * 0.002;

    for (let i = 0; i < bufferLength; i++) {
      const rawHeight = dataArray[i];
      const barHeight = rawHeight * 2.2; // усиливаем через степень

      const hue = (i * 5 + time * 50) % 360;
      ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.75)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  draw();
}
