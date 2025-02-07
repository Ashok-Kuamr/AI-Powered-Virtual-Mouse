const webcamElement = document.getElementById("webcam");
const cursor = document.getElementById("cursor");
const startWebcamBtn = document.getElementById("startWebcamBtn");
const stopWebcamBtn = document.getElementById("stopWebcamBtn");
const gestureDisplay = document.getElementById("gesture-display");

const URL = "https://teachablemachine.withgoogle.com/models/a_6X51V-b/";

let model, maxPredictions;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let isMoving = false;
let isModelLoaded = false;  // Flag to check if model is loaded
let webcamStream = null;

// Load Teachable Machine Model
async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        if (!window.tmImage) {
            throw new Error("Teachable Machine library not loaded!");
        }

        model = await window.tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("Model Loaded Successfully!");
        isModelLoaded = true;  // Set flag to true when model is loaded
    } catch (error) {
        console.error("Error loading model:", error);
    }
}

loadModel();

// Start webcam
async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamElement.srcObject = stream;
        webcamStream = stream;
        startWebcamBtn.disabled = true;  // Disable start button after starting webcam
        stopWebcamBtn.disabled = false;  // Enable stop button
    } catch (error) {
        console.error("Webcam access denied!", error);
    }
}

// Stop webcam
function stopWebcam() {
    if (webcamStream) {
        const tracks = webcamStream.getTracks();
        tracks.forEach(track => track.stop());
        webcamElement.srcObject = null;
        startWebcamBtn.disabled = false;  // Enable start button
        stopWebcamBtn.disabled = true;  // Disable stop button
    }
}

// AI Gesture Prediction
async function predict() {
    if (!isModelLoaded) {
        console.error("Model not loaded yet!");
        return;
    }

    const prediction = await model.predict(webcamElement);

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > 0.8) {  // High confidence
            const gesture = prediction[i].className;
            console.log(`Detected: ${gesture}`);

            // Update gesture on screen
            gestureDisplay.textContent = `Gesture: ${gesture}`;

            if (gesture === "Move") {
                isMoving = true;
            } else if (gesture === "Stop") {
                isMoving = false;
            } else if (gesture === "Click") {
                simulateClick();
            }
        }
    }
}

// Update cursor position based on movement
function updateMousePosition() {
    if (isMoving) {
        mouseX += (Math.random() * 10 - 5); // Simulate movement
        mouseY += (Math.random() * 10 - 5);
        moveCursor(mouseX, mouseY);
    }
}

// Move the cursor on screen
function moveCursor(x, y) {
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
    cursor.style.transform = `translate(-50%, -50%)`;  // Centering the cursor
}

// Simulate a mouse click
function simulateClick() {
    let event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
    });
    document.elementFromPoint(mouseX, mouseY).dispatchEvent(event);
}

// Run prediction every 100ms and update cursor every 50ms
setTimeout(() => setInterval(predict, 100), 3000); // Delay to ensure model is loaded first
setInterval(updateMousePosition, 50);

// Event listeners for the buttons
startWebcamBtn.addEventListener("click", startWebcam);
stopWebcamBtn.addEventListener("click", stopWebcam);
