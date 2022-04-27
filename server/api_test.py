import requests

print("testing api requests... ")
resp = requests.post("http://localhost:5000/predict",
                     files={"file": open('no_mask.jpg','rb')})

print('label no_mask')
print(resp.json()['Prediction'])

resp = requests.post("http://localhost:5000/predict",
                     files={"file": open('with_mask.jpg','rb')})

print('label with_mask')
print(resp.json()['Prediction'])