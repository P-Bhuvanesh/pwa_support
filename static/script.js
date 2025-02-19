// Handle text input submission
document.getElementById("dataForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    let text = document.getElementById("textInput").value;
    let responseMessage = document.getElementById("responseMessage");

    try {
        let response = await fetch("/api/data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text })
        });

        let result = await response.json();
        responseMessage.innerText = result.message;
    } catch (error) {
        responseMessage.innerText = "Error sending data!";
    }
});

// Camera functionality
const openCameraBtn = document.getElementById("openCameraBtn");
const switchCameraBtn = document.getElementById("switchCameraBtn");
const captureBtn = document.getElementById("captureBtn");
const video = document.getElementById("camera");
const cameraContainer = document.getElementById("cameraContainer");
const canvas = document.createElement("canvas");
const capturedImage = document.getElementById("originalImage");

let stream = null;
let useFrontCamera = false; // Default: Use back camera

// Function to start the camera
async function startCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: { facingMode: useFrontCamera ? "user" : "environment" }
    };

    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.play();

        cameraContainer.style.display = "flex"; // Show camera container
        openCameraBtn.style.display = "none"; // Hide open camera button
    } catch (error) {
        console.error("Error accessing webcam:", error);
    }
}

// Open Camera on Button Click
openCameraBtn.addEventListener("click", startCamera);

// Switch Camera
switchCameraBtn.addEventListener("click", function () {
    useFrontCamera = !useFrontCamera;
    startCamera(); // Restart the camera with new setting
});

// Capture Image
captureBtn.addEventListener("click", function () {
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Stop the camera
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    cameraContainer.style.display = "none"; // Hide camera preview
    openCameraBtn.style.display = "block"; // Show open camera button again

    // Convert image to Blob and display preview
    canvas.toBlob(blob => {
        capturedImage.src = URL.createObjectURL(blob);
        sendImageToServer(blob);
    }, "image/png");
});

// Send image to Flask backend
function sendImageToServer(file) {
    const formData = new FormData();
    formData.append("image", file);

    fetch("/process-image", {
        method: "POST",
        body: formData,
    })
    .then(response => response.blob())
    .then(blob => {
        document.getElementById("processedImage").src = URL.createObjectURL(blob);
    })
    .catch(error => console.error("Error processing image:", error));
}
