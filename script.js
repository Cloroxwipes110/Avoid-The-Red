import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
console.log("Running Version STABLE 1.0.1")
console.log("Lol why are you still reading this")

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(4.61, 2.74, 8)

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antiadlias: true
})
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

const controls = new OrbitControls(camera, renderer.domElement)

class Box extends THREE.Mesh {
  constructor({
    width,
    height,
    depth,
    color = '#00ff00',
    velocity = {
      x: 0,
      y: 0,
      z: 0
    },
    position = {
      x: 0,
      y: 0,
      z: 0
    },
    zAcceleration = false
  }) {
    super(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color })
    )

    this.width = width
    this.height = height
    this.depth = depth

    this.position.set(position.x, position.y, position.z)

    this.right = this.position.x + this.width / 2
    this.left = this.position.x - this.width / 2

    this.bottom = this.position.y - this.height / 2
    this.top = this.position.y + this.height / 2

    this.front = this.position.z + this.depth / 2
    this.back = this.position.z - this.depth / 2

    this.velocity = velocity
    this.gravity = -0.002
    this.canJump = true
    this.zAcceleration = zAcceleration
  }

  updateSides() {
    this.right = this.position.x + this.width / 2
    this.left = this.position.x - this.width / 2

    this.bottom = this.position.y - this.height / 2
    this.top = this.position.y + this.height / 2

    this.front = this.position.z + this.depth / 2
    this.back = this.position.z - this.depth / 2
  }

  update(ground) {
    this.updateSides()

    if (this.zAcceleration) this.velocity.z += 0.0003

    this.position.x += this.velocity.x
    this.position.z += this.velocity.z

    this.applyGravity(ground)
  }

  applyGravity(ground) {
    this.velocity.y += this.gravity

    if (boxCollision({
      box1: this,
      box2: ground
    })) {
      this.velocity.y = 0
      this.position.y = ground.top + this.height / 2
      this.canJump = true
    } else {
      this.position.y += this.velocity.y
      this.canJump = false
    }
  }
}

function boxCollision({ box1, box2 }) {
  const xCollision = box1.right >= box2.left && box1.left <= box2.right
  const yCollision =
    box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom
  const zCollision = box1.front >= box2.back && box1.back <= box2.front

  return xCollision && yCollision && zCollision
}

const cube = new Box({
  width: 1,
  height: 1,
  depth: 1,
  velocity: {
    x: 0,
    y: -0.01,
    z: 0
  },
  canJump: true
})
cube.castShadow = true
scene.add(cube)

const ground = new Box({
  width: 10,
  height: 0.5,
  depth: 50,
  color: '#0369a1',
  position: {
    x: 0,
    y: -2,
    z: 0
  }
})

ground.receiveShadow = true
scene.add(ground)

const light = new THREE.DirectionalLight(0xffffff, 0.7)
light.position.x = 2
light.position.y = 3
light.position.z = 2
light.castShadow = true
scene.add(light)

scene.add(new THREE.AmbientLight(0xffffff, 0.5))

camera.position.z = 5

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  s: {
    pressed: false
  },
  w: {
    pressed: false
  }
}

var firstperson = false
var followmode = false

function setFirstPersonView() {
  if (firstperson) {
    camera.position.set(cube.position.x, cube.position.y + 0.5, cube.position.z)
    camera.lookAt(cube.position.x, cube.position.y + 0.5, cube.position.z - 1)
  } else {
    camera.position.set(cube.position.x, cube.position.y + 4, cube.position.z + 10)
  }
}

function setFollowVeiw() {
  if (followmode) {
    camera.position.set(cube.position.x, cube.position.y + 4, cube.position.z + 6)
    camera.lookAt(cube.position.x, cube.position.y, cube.position.z - 10)
  } else {

  }
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'KeyM') {
    isPaused = !isPaused
    if (isPaused) {
      pauseMenu.style.display = 'flex'
      document.querySelector('#pauseScore').textContent = score
      document.querySelector('#pauseHighScore').textContent = localStorage.getItem('highScore') || 0
    } else {
      pauseMenu.style.display = 'none'
    }
    return
  }

  if (isPaused) return

  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = true
      break
    case 'KeyD':
      keys.d.pressed = true
      break
    case 'KeyS':
      keys.s.pressed = true
      break
    case 'KeyW':
      keys.w.pressed = true
      break
    case 'Space':
      if (cube.canJump) {
        cube.velocity.y = 0.08
        cube.canJump = false
      }
      break
    case 'KeyP':
      firstperson = !firstperson
      followmode = false
      setFirstPersonView()
      break
    case 'KeyF':
      followmode = !followmode
      firstperson = false
      setFollowVeiw()
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = false
      break
    case 'KeyD':
      keys.d.pressed = false
      break
    case 'KeyS':
      keys.s.pressed = false
      break
    case 'KeyW':
      keys.w.pressed = false
      break
  }
})

const enemies = []
const coins = []

let frames = 0
let spawnRate = 300
// Create restart UI
// Create score UI
const scoreUI = document.createElement('div')
scoreUI.id = 'scoreUI'
scoreUI.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  color: white;
  font-family: sans-serif;
  font-size: 24px;
`
document.body.appendChild(scoreUI)

let score = 0
let coins_count = 0
const updateScore = () => {
  const highScore = localStorage.getItem('highScore') || 0
  const coinscountother = localStorage.getItem('coinsCount') || 0
  scoreUI.textContent = `Score: ${score} | High Score: ${highScore} | Coins: ${coinscountother}` 
}
updateScore()

// Create pause menu
const pauseMenu = document.createElement('div')
pauseMenu.id = 'pauseMenu'
pauseMenu.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: none;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
`
pauseMenu.innerHTML = `
  <div style="color: white; font-family: sans-serif; text-align: center; background: #0369a1; padding: 20px; border-radius: 10px;">
    <h2>Paused</h2>
    <p>Current Score: <span id="pauseScore">0</span></p>
    <p>High Score: <span id="pauseHighScore">0</span></p>
    <div style="margin: 20px 0;">
      <h3>Change Cube Color</h3>
      <div style="margin-bottom: 10px;">
        <input type="text" id="hexColorInput" placeholder="#RRGGBB" 
          style="padding: 5px; border-radius: 3px; border: 1px solid #ccc; margin-right: 5px;">
        <button onclick="applyCustomColor()" 
          style="padding: 5px 10px; background: #04294d; color: white; border: none; border-radius: 3px; cursor: pointer;">
          Apply Color
        </button>
      </div>
      <div>
        <button onclick="changeCubeColor('#ffff00')" style="background: #ffff00; width: 30px; height: 30px; margin: 5px; border: none;"></button>
        <button onclick="changeCubeColor('#00ff00')" style="background: #00ff00; width: 30px; height: 30px; margin: 5px; border: none;"></button>
        <button onclick="changeCubeColor('#0000ff')" style="background: #0000ff; width: 30px; height: 30px; margin: 5px; border: none;"></button>
        <button onclick="changeCubeColor('#a020f0')" style="background: #a020f0; width: 30px; height: 30px; margin: 5px; border: none;"></button>
      </div>
    </div>
    <button id="resumeButton" style="padding: 10px 20px; background: #04294d; color: white; border: none; border-radius: 5px; cursor: pointer;">Resume Game</button>
  </div>
`
document.body.appendChild(pauseMenu)

let isPaused = false

window.changeCubeColor = (color) => {
  cube.material.color.set(color)
}

window.applyCustomColor = () => {
  const hexInput = document.getElementById('hexColorInput').value;
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (hexRegex.test(hexInput)) {
    changeCubeColor(hexInput);
  } else {
    alert('Please enter a valid hex color code (e.g., #FF0000)');
  }
}

document.querySelector('#resumeButton').addEventListener('click', () => {
  isPaused = false
  pauseMenu.style.display = 'none'
})

// Load quotes from JSON
let gameQuotes = [];
fetch('quotes.json')
  .then(response => response.json())
  .then(data => {
    gameQuotes = data.quotes;
  })
  .catch(error => {
    console.error('Error loading quotes:', error);
    // Fallback quotes in case the file fails to load
    gameQuotes = [
      "Game over, but every failure is a step forward.",
      "The harder the game, the sweeter the victory."
    ];
  });

// Function to get a random quote
function getRandomQuote() {
  if (gameQuotes.length === 0) return "Uhh, no quotes, what did you do?";
  const randomIndex = Math.floor(Math.random() * gameQuotes.length);
  return gameQuotes[randomIndex];
}

const restartUI = document.createElement('div')
restartUI.id = 'restartUI'
restartUI.innerHTML = `
  <div style="color: white; font-family: sans-serif; text-align: center;">
    <h1>Game Over!</h1>
    <p id="randomQuote" style="font-style: italic; color: #cccccc; margin: 10px 0 20px 0;">Loading quote...</p>
    <p>Score: <span id="finalScore">0</span></p>
    <p>High Score: <span id="highScore">0</span></p>
    <button id="restartButton">Restart Game</button>
  </div>
`
restartUI.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: none;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
`
document.body.appendChild(restartUI)

// Initialize high score display
document.querySelector('#highScore').textContent = localStorage.getItem('highScore') || 0

document.querySelector('#restartButton').addEventListener('click', () => {
  // Reset game state
  enemies.forEach(enemy => scene.remove(enemy))
  coins.forEach(coin => scene.remove(coin))
  enemies.length = 0
  cube.position.set(0, 0, 0)
  cube.velocity.x = 0
  cube.velocity.y = -0.01
  cube.velocity.z = 0
  frames = 0
  spawnRate = 200
  score = 0
  updateScore()

  // Hide restart UI
  restartUI.style.display = 'none'

  // Restart animation
  animate()
})

function animate() {
  const animationId = requestAnimationFrame(animate)
  renderer.render(scene, camera)

  if (isPaused) return

  // movement code
  cube.velocity.x = 0
  cube.velocity.z = 0
  if (keys.a.pressed) cube.velocity.x = -0.05
  else if (keys.d.pressed) cube.velocity.x = 0.05

  if (keys.s.pressed) cube.velocity.z = 0.05
  else if (keys.w.pressed) cube.velocity.z = -0.05

  cube.update(ground)

  if (cube.position.y < -10) {
    gameOver(animationId)
  }

  function updateHighScore() {
    const currentHighScore = localStorage.getItem('highScore') || 0
    if (score > currentHighScore) {
      localStorage.setItem('highScore', score)
    }
    document.querySelector('#highScore').textContent = localStorage.getItem('highScore') || 0
  }

  function gameOver(animationId) {
    cancelAnimationFrame(animationId)
    document.querySelector('#finalScore').textContent = score
    document.querySelector('#randomQuote').textContent = getRandomQuote()
    updateHighScore()
    document.querySelector('#restartUI').style.display = 'flex'
  }

  if (firstperson) {
    setFirstPersonView()
  }

  if (followmode) {
    setFollowVeiw()
  }

  coins.forEach((coin) => {
    coin.update(ground)
    if (
      boxCollision({
        box1: cube,
        box2: coin
      })
    ) {
      localStorage.setItem('coinsCount', Number(coins_count) + 1) || 0
      scene.remove(coin)
    }
  })

  enemies.forEach((enemy) => {
    enemy.update(ground)
    if (
      boxCollision({
        box1: cube,
        box2: enemy
      })
    ) {
      gameOver(animationId)
    }
  })

  if (spawnRate > 20 && Math.random() < 0.001) {
    const coin = new Box({
      width: 1,
      height: 1,
      depth: 1,
      position: {
        x: (Math.random() - 0.5) * 10,
        y: 0,
        z: -25,
      },
      velocity: {
        x: 0,
        y: 0,
        z: 0.005
      },
      color: 'yellow',
      zAcceleration: true
    })
    coin.castShadow = true
    scene.add(coin)
    coins.push(coin)
  }

  if (frames % spawnRate === 0) {
    if (spawnRate > 30) spawnRate -= 10

    const enemy = new Box({
      width: 1,
      height: 1,
      depth: 1,
      position: {
        x: (Math.random() - 0.5) * 10,
        y: 0,
        z: -25
      },
      velocity: {
        x: 0,
        y: 0,
        z: 0.005
      },
      color: 'red',
      zAcceleration: true
    })
    enemy.castShadow = true
    scene.add(enemy)
    enemies.push(enemy)
  }

  frames++
  if (frames % 60 === 0) {
    score++
    updateScore()
    coins_count = localStorage.getItem('coinsCount') || 0
  }
}
animate()
// Lol why are you reading this
// DON'T STEAL MY CODE