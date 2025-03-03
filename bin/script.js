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


document.getElementById("uploadInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("originalImage").src = e.target.result;
        };
        reader.readAsDataURL(file);

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
});
