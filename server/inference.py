import io

import torchvision.transforms as transforms
import torch
from models.face_detect import Net
from PIL import Image

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print("using ", device)

model = Net()
model.load_state_dict(torch.load("model_state_dict.pt",map_location=device))
model.eval()
classes = ('with_mask','no_mask')

def transform_image(image_bytes):
    my_transforms = transforms.Compose([
        transforms.Resize([32,32]),
        transforms.ToTensor()])
    image = Image.open(io.BytesIO(image_bytes))
    return my_transforms(image).unsqueeze(0)


def get_prediction(image_bytes):
    tensor = transform_image(image_bytes=image_bytes)
    outputs = model(tensor)
    _, y_hat = outputs.max(1)
    return classes[y_hat]



if __name__ == "__main__":
    # Test reading of images
    print("running inference test ...")
    try:
        with open("with_mask.jpg", 'rb') as f:
            image_bytes = f.read()
            x = transform_image(image_bytes)

            if not torch.is_tensor(x):
                print("tensor file error")
            print("image -> tensor working")
            
            x = get_prediction(image_bytes)

            print('label : with_mask , prediction : {}'.format(x))

        print("--------")

        with open("no_mask.jpg", 'rb') as f:
            image_bytes = f.read()
            x = transform_image(image_bytes)

            if not torch.is_tensor(x):
                print("tensor file error")
            print("image -> tensor working")

            x = get_prediction(image_bytes)

            print('label : no_mask , prediction : {}'.format(x))


    except:
        print("image file error")
   
