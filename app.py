from flask import Flask, render_template, request, jsonify, send_file
import cv2
import numpy as np
import io

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/data', methods=['POST'])
def get_data():
    data = request.json.get('text', '')
    return jsonify({"message": f"Received: {data}"})

@app.route('/process-image', methods=['POST'])
def process_image():
    file = request.files['image']
    if not file:
        return "No file uploaded", 400

    # Convert to OpenCV format
    img_stream = file.read()
    np_img = np.frombuffer(img_stream, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    # Apply Image Processing (Grayscale)
    processed_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Encode the processed image
    _, img_encoded = cv2.imencode('.png', processed_img)
    return send_file(io.BytesIO(img_encoded.tobytes()), mimetype='image/png')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
