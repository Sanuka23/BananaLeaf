from flask import Flask, request, jsonify
import numpy as np
import json
import tensorflow as tf
from PIL import Image
import io

app = Flask(__name__)

# Load the model
cnn = tf.keras.models.load_model("model_3.h5")

# Load class names from JSON file
with open("class_names.json", "r") as f:
    class_names = json.load(f)

def load_image(image_data):
    image = Image.open(io.BytesIO(image_data))
    image = image.resize((224, 224))
    image_array = np.array(image)
    image_array = np.array([image_array])  # Convert single image to batch
    return image_array

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        file = request.files['image']
        if file:
            image_data = file.read()
            image_array = load_image(image_data)
            predictions = cnn.predict(image_array)
            result_index = np.where(predictions[0] == max(predictions[0]))
            predicted_class = class_names[result_index[0][0]]
            return jsonify({"predicted_class": predicted_class})

if __name__ == '__main__':
    app.run(debug=True)