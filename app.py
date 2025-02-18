from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/data', methods=['POST'])
def get_data():
    data = request.json.get('text', '')
    return jsonify({"message": f"Received: {data}"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

