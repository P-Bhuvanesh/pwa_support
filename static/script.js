if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/static/service-worker.js")
        .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
            console.log("Service Worker registration failed:", error);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const captureBtn = document.getElementById("capture-btn");
    const processBtn = document.getElementById("process-btn");
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const uploadedImage = document.getElementById("uploaded-image");
    const dropArea = document.getElementById("drop-area");
    const fileInput = document.getElementById("file-input");
    let stream = null;

    dropArea.addEventListener("click", () => fileInput.click());

    dropArea.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropArea.style.backgroundColor = "#d8ecff";
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.style.backgroundColor = "#e9f5ff";
    });

    dropArea.addEventListener("drop", (event) => {
        event.preventDefault();
        dropArea.style.backgroundColor = "#e9f5ff";
        if (event.dataTransfer.files.length > 0) {
            fileInput.files = event.dataTransfer.files;
            previewImage();
        }
    });

    fileInput.addEventListener("change", previewImage);

    function previewImage() {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                uploadedImage.src = e.target.result;
                uploadedImage.classList.remove("hidden");
                processBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    }

    // Start webcam stream
    captureBtn.addEventListener("click", async () => {
        if (!stream) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;
                video.classList.remove("hidden");
                captureBtn.textContent = "Capture Photo";
            } catch (err) {
                console.error("Error accessing webcam:", err);
                alert("Could not access webcam. Please allow camera permissions.");
            }
        } else {
            // Capture the frame from the video
            const context = canvas.getContext("2d");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert canvas to an image
            const imageDataURL = canvas.toDataURL("image/png");
            uploadedImage.src = imageDataURL;
            uploadedImage.classList.remove("hidden");
            processBtn.disabled = false;

            // Stop webcam stream after capturing
            video.srcObject.getTracks().forEach(track => track.stop());
            video.classList.add("hidden");
            captureBtn.textContent = "Capture from Webcam";
            stream = null;
        }
    });

    processBtn.addEventListener("click", async () => {
        if (!uploadedImage.src) {
            alert("No image to process!");
            return;
        }

        const blob = await fetch(uploadedImage.src).then(res => res.blob());
        const formData = new FormData();
        formData.append("image", blob, "captured.png");

        const response = await fetch("/process-image", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            document.getElementById("processed-image").src = url;
            document.getElementById("processed-image").classList.remove("hidden");
        } else {
            console.error("Error processing image:", await response.text());
        }
    });
});
