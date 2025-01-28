const canvas = document.getElementById("drawingCanvas")
const ctx = canvas.getContext("2d")
let isDrawing = false

const calculation = document.getElementById("calculation")
const validate = document.getElementById("predictButton")
const result = document.getElementById("output")
let isCorrect = false
i=0
y=0

const allCalculations = [
    ["1 + 2", "3"],
    ["2 + 2", "4"],
    ["5 - 4", "1"],
    [ "81 ÷ 9", "9" ],
    [ "(200 - ((6^2) ÷ 3) + 15) % 10", "5" ],
    [ "(((1000 ÷ 25) × (6^3) - (50 × 7)) % 10)", "0" ],
    ["Combien de pattes à un mille-patte qui as perdu 992 pattes ?", "8"],
    ["Combien de fois je suis passé Master ?", "0"],
    ["Commbien j'ai de chats ?", "2"],
    ["Quel âge à mon neuveu ?", "3"],
    ["Trouve le nombre auquel je pense", "7"],
    ["Quel est le seul chiffre qui n'a pas été un réponse ?", "6"],
    ["lorem psum", "0"],
]

// Initialize the game
calculation.innerHTML = allCalculations[i][y];

    
    // Initialize canvas
    ctx.fillStyle = "black"
    ctx.lineWidth = 10
    ctx.lineCap = "round"
    ctx.strokeStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Drawing event handlers
    canvas.addEventListener("mousedown", () => {
      isDrawing = true
    })
  canvas.addEventListener("mouseup", () => {
    isDrawing = false
    ctx.beginPath()
  })
  canvas.addEventListener("mousemove", draw)

  // Draw function
  function draw(event) {
    if (!isDrawing) return
    ctx.lineTo(
      event.clientX - canvas.offsetLeft,
      event.clientY - canvas.offsetTop
    )
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(
      event.clientX - canvas.offsetLeft,
      event.clientY - canvas.offsetTop
    )
  }

  // Clear button
  document.getElementById("clearButton").addEventListener("click", () => {
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  })

  // Predict button
  document.getElementById("predictButton").addEventListener("click", async () => {
    // Resize the canvas drawing to 28x28 and normalize
    const resizedImage = getResizedImage(canvas, 28, 28)
    const normalizedImage = normalizeImage(resizedImage)
    
    // Load the ONNX model and make a prediction
    try {
      const modelUrl = "./model/model.onnx" // Path to your ONNX model
      const session = await ort.InferenceSession.create(modelUrl)
      
      //  console.log(normalizedImage)
      const inputTensor = new ort.Tensor(
        "float32",
        normalizedImage,
        [1, 1, 28, 28]
      )
      //  console.log(inputTensor)
      const feeds = { input: inputTensor } // Replace "input" with the actual input name
      const results = await session.run(feeds)
      
      const output = results[Object.keys(results)[0]].data
      const predictedDigit = output.indexOf(Math.max(...output))
      document.getElementById("output").textContent = predictedDigit
      
      if (predictedDigit == allCalculations[i][y+1]) {
        isCorrect = true
        console.log("Correct")
        i+=1
        calculation.innerHTML = allCalculations[i][y];
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        if (i==allCalculations.length-1) {
          calculation.innerHTML = "VICTOIRE !!!!!"
        }
      }
      
    } catch (error) {
      console.error("Error during inference:", error)
      document.getElementById("output").textContent = "Error during prediction. Check the console for details."
    }
  })

  // Helper functions
  function getResizedImage(canvas, width, height) {
    const offScreenCanvas = document.createElement("canvas")
    offScreenCanvas.width = width
    offScreenCanvas.height = height
    const offScreenCtx = offScreenCanvas.getContext("2d")
    
    offScreenCtx.drawImage(canvas, 0, 0, width, height)
    return offScreenCtx.getImageData(0, 0, width, height)
  }

  function normalizeImage(imageData) {
    const { data, width, height } = imageData
    const normalized = new Float32Array(width * height)
    
    for (let i = 0; i < data.length; i += 4) {
      var grayscale = data[i] / 255.0 // Normalize pixel to [0, 1]
      grayscale = grayscale - 0.1309
      grayscale = grayscale / 0.3018
      normalized[i / 4] = grayscale
    }
    //console.log(normalized)
    return normalized
  }
