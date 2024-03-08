var musicFFT;
var musicAnalyzer
var backgroundSound;
var music;
var playPauseButton;
var volumeSlider;
var backgroundSoundSlider;
var backgroundVolumn;
var backgroundColor;
var drops = [];
var circleRadius = 400;

var isPreloadDone = false; // Flag to indicate when preload is finished

// preloaf backgroundsound and music
function preload() {
    backgroundSound = loadSound("audio/soft-rain-ambient-111154.mp3");
    music = loadSound("audio/Lobo Loco - Last Potatoe on Fire (ID 2088).mp3");
    isPreloadDone = true;
}

function setup() {
    getAudioContext().suspend();
    createCanvas(windowWidth, windowHeight);

    // set background music
    backgroundSound.loop();
    backgroundVolumn = 0.5
    backgroundSound.setVolume(backgroundVolumn);

    // set backgroundSoundSlider for the backgroundSound volumn, which will affect the thickness of raindrop, also the slider thumb size
    backgroundSoundSlider = document.getElementById('backgroundsoundSlider');
    backgroundSoundSlider.addEventListener("input", () => {
      backgroundVolumn = parseFloat(backgroundSoundSlider.value);
      backgroundSound.setVolume(backgroundVolumn); 
      updateThumbSize(backgroundVolumn);
    });

    // set the play/pause button
    playPauseButton = document.getElementById('playPauseButton');
    playPauseButton.addEventListener('click', togglePlay);

    // set music volumn slider
    volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.addEventListener('input', changeVolume);
  
    // creaye musicFFT and analyzer
    musicFFT = new p5.FFT();
    musicAnalyzer = new MusicAnalyzer(music, musicFFT);

    // show elements after loading
    if (isPreloadDone){
      let screen = document.getElementById('screen');
      screen.style.display = 'flex';
      let remark = document.getElementById('remark');
      remark.style.display = 'block';
    }  

}

function draw() {
    let red = map(backgroundVolumn, 0, 1, 116, 63);
    let green = map(backgroundVolumn, 0, 1, 155, 29);
    let blue = map(backgroundVolumn, 0, 1, 194, 56);
  
    // Update background and slider color
    backgroundColor = color(red, green, blue);
    background(backgroundColor);
    backgroundSoundSlider.style.setProperty('--silderColor',backgroundColor);

    circle(windowWidth/2, windowHeight/2, circleRadius);
    
    // Update music analyzer and Draw visualization for music spectrum
    musicAnalyzer.update();
    musicAnalyzer.display();

    // visualize drops
    for (let d of drops){
      d.show()
      d.update()
    }

    // create drops
    for (let i = 0; i < 1; i++){
      drops.push(new Drop(random(width), 0))
    }
}  

function keyPressed() {
  userStartAudio();
}

function togglePlay() {
  if (music.isPlaying()) {
    music.pause();
    playPauseButton.textContent = 'PLAY';; 
  } else {
    userStartAudio().then(function() {
        music.loop();
        });
    music.setVolume(0.5);
    playPauseButton.textContent = 'PAUSE';; 
  }
}

function updateThumbSize(sliderValue) {
  size = Math.floor(sliderValue*40)+10;
  backgroundSoundSlider.style.setProperty('--sliderSize', `${size}px`);
  backgroundSoundSlider.style.setProperty('--silderColor',backgroundColor);

}

function changeVolume() {
  volumn = parseFloat(this.value); 
  music.setVolume(volumn);
}

function windowResized() {
  resizeCanvas(Math.max(windowWidth, 700), Math.max(windowHeight, 700));
}

// Custom Analyzer class for music
class MusicAnalyzer {
  constructor(sound, fft) {
    this.sound = sound;
    this.fft = fft;
    this.fft.setInput(this.sound); 
    this.spectrum = [];
  }
  
  update() {
    // Analyze music
    this.spectrum = this.fft.analyze();
  }
  
  display() {
    // Draw visualization for music spectrum
    stroke(255);

    push();
    translate(width / 2, height / 2);
    for (var i = 0; i < this.spectrum.length; i++) {
      var angle = map(i, 0, this.spectrum.length, 0, 360);
      var amp = this.spectrum[i];
      var r = map(amp, 0, 256, 170, 450);
      var x = r * cos(angle);
      var y = r * sin(angle);
      line(0, 0, x, y);
    }
    pop();
  }
}

class Drop{
  constructor(x, y){
    this.pos = createVector(x, y)
    this.vel = createVector(0, random(8, 11))
    this.length = random(20, 40)
    this.range = map(backgroundVolumn, 0, 1, 0, 255);
    this.thick = random(this.range);
  }
  show(){
    stroke(255, this.thick)
    line(this.pos.x, this.pos.y, this.pos.x, this.pos.y-this.length)
  }
  
  update(){
    this.pos.add(this.vel)
    if (this.pos.y > height + 100){
      drops.shift()
    }
  } 
}