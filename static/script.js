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
