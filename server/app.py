import base64
from flask import Flask, jsonify, request
from server.inference import get_prediction
app = Flask(__name__)

@app.route('/', methods=['GET'])
def test():
    return "APi endpoint work"

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        file = request.files['file']
        img_bytes = file.read()
        pred = get_prediction(image_bytes=img_bytes)
        return jsonify({'Prediction': pred})

@app.route('/photo', methods=['POST'])
def photo():
    pred = ""

    if request.method == 'POST':
        try:
            photo = request.get_json()

            photo_data = base64.b64decode(photo['photo'])
            pred = get_prediction(image_bytes=photo_data)

            # print(jsonify({'Prediction': pred}))
            return jsonify({'Prediction': pred})
        except:
            return jsonify({'Prediction': pred})

        
    
    return jsonify({'Prediction': pred})


if __name__ == '__main__':
    app.run(host="0.0.0.0") 
    # ,localhssl_context='adhoc'
    