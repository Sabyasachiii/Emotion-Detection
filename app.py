from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import cv2
from flask_cors import CORS

model = tf.keras.models.load_model('emotion_model.h5')

emotion_labels = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"]

app = Flask(__name__)
CORS(app)  

@app.route('/predict', methods=['POST'])
def predict():
    try:
        file = request.files['image']
        image_np = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(image_np, cv2.IMREAD_GRAYSCALE)

        img = cv2.resize(img, (48, 48))
        img = img.reshape(1, 48, 48, 1) / 255.0  

        prediction = model.predict(img)
        emotion = emotion_labels[np.argmax(prediction)]

        return jsonify({'emotion': emotion})
    
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
