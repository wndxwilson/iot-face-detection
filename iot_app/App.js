import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput } from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [faces, setFaces] = useState([])
  const [req, setReq] = useState(false)
  const [result, setResult] = useState({ text: "", color: "green" })
  const [apiEndpoint, setApiEndpoint] = useState("http://192.168.50.90:5000/photo")

  const cameraRef = useRef();
  const [counter, setCounter] = useState(0)
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <Text> No camera found </Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const handleFacesDetected = ({ f }) => {
    setFaces(f)
    if (req) {
      setReq(false)
      takePicture()
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      console.log("take picture: ", counter)

      const options = { quality: 0.7, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      const source = data.base64;

      let requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ photo: source })
      };

      try {
        const response = await fetch(apiEndpoint, requestOptions);
        let json_res = await response.json()
        if (json_res.Prediction === "with_mask") {
          setResult({
            text: "Mask", color: "green"
          })
        } else {
          setResult({
            text: "No Mask", color: "red"
          })
        }
        setReq(true)
        setCounter(counter + 1)
      }
      catch (error) {
        console.error(error);
        setReq(false)
      }
    }

  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title_text}> Mask Detection App</Text>
      <Camera style={styles.camera} type={Camera.Constants.Type.front} ref={cameraRef} onCameraReady={() => { setReq(true) }} onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
          minDetectionInterval: 100,
          tracking: true,
        }} >
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
          }}>
          {faces[0] && <View style={{
            height: faces[0].bounds.size.height,
            width: faces[0].bounds.size.width,
            left: faces[0].bounds.origin.x,
            top: faces[0].bounds.origin.y,
            borderWidth: 2,
            borderColor: '#00FF00',
            backgroundColor: 'transparent',
          }} />}
        </View>
      </Camera>

      {faces[0] ? <Text style={{
        fontSize: 30,
        textAlign: 'center',
        fontStyle: 'normal',
        flex: 1,
        color: result.color
      }}> {result.text} </Text> : <Text style={{
        fontSize: 30,
        textAlign: 'center',
        fontStyle: 'normal',
        flex: 1
      }}>No face detected</Text>}

      <View style={styles.userInput}>
        <Text style={{
          flex: 1,
          textAlign: 'right',
          paddingHorizontal: 10,
          fontWeight: 'bold'
        }}>EndPoint:</Text>
        <TextInput
          style={{
            flex: 3,
            borderWidth: 1,
            padding: 10,

          }}
          onChangeText={setApiEndpoint}
          value={apiEndpoint}
          placeholder="apiEndpoint"
        />

      </View>

    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'column'
  },
  title_text: {
    margin: 20,
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
  },
  camera: {
    flex: 8,
    margin: 10
  },
  userInput: {
    flex: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 30
  }
});
