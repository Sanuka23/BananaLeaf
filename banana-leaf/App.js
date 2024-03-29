import React, { useState, useEffect } from "react";
import { StyleSheet, View, Button, Image, Text, Modal, TouchableOpacity, ImageBackground } from "react-native";
import { launchCameraAsync, launchImageLibraryAsync, MediaTypeOptions, requestMediaLibraryPermissionsAsync, requestCameraPermissionsAsync } from "expo-image-picker";
import { Permissions } from 'expo';
import Icon from "react-native-vector-icons/Ionicons";

export default function App() {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const takePhotoFromCamera = async () => {
    try {
      const { status } = await requestCameraPermissionsAsync();


      if (status !== 'granted') {
        console.error('Camera permission not granted');
        return;
      }

      let result = await launchCameraAsync({
        allowsEditing: true,
        aspect: [6, 6],
        mediaTypes: MediaTypeOptions.Images,
      });

      console.log("Camera Result:", result);

      if (!result.cancelled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setImage(result.assets[0].uri);
      } else {
        console.log("Image selection cancelled or URI not found");
      }
    } catch (error) {
      console.error("Error occurred while taking photo:", error);
    }
  };


  const takePhotoFromGallery = async () => {
    try {

      const { status } = await requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        console.error('Camera permission not granted');
        return;
      }

      let result = await launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [6, 6],
        mediaTypes: MediaTypeOptions.Images,
      });

      console.log("Gallery Result:", result); // Add this line to check the result object

      if (!result.cancelled && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      } else {
        console.log("Image selection cancelled");
      }
    } catch (error) {
      console.error(
        "Error occurred while selecting photo from gallery:",
        error
      );
    }
  };

  const handlePredict = async () => {
    try {
      if (!image) {
        console.error("Please select or take a photo before predicting");
        setError("Please select or take a photo before predicting");
        setModalVisible(true);
        return;
      }

      const formData = new FormData();
      formData.append("image", { uri: image, name: "image.jpg", type: "image/jpeg", });

      const response = await fetch("https://veggie-vista-api-veggie-vista.koyeb.app/predict", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Prediction Response:", data); // Log the response object for inspection
        setError("");

        if (data.predicted_class) { // Check if "class" property exists
          setPrediction(data.predicted_class);
          setModalVisible(true); // Show modal when prediction is successful
        } else {
          console.error("API response missing 'class' property");
          setError("Failed to predict ingredient");
          setModalVisible(true);
        }
      } else {
        console.error("Failed to make prediction");
        setError("Failed to make prediction");
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Error occurred while making prediction:", error);
      setError("Error occurred while making prediction");
      setModalVisible(true);
    }
  };

  const handleCancel = () => {
    setImage(null); // Reset image to remove it
    setModalVisible(false); // Close the modal
    setPrediction(null);
  };


  return (
    <View style={styles.container}>
      {image && (
        <Image source={{ uri: image }} style={{ width: 320, height: 320 }} />
      )}
      <View style={styles.buttonContainer}>
        <Button title="Take Photo" onPress={takePhotoFromCamera} />
        <Button title="Choose Photo" onPress={takePhotoFromGallery} />
      </View>
      <View style={styles.predictButtonContainer}>
        <Button title="Predict" onPress={handlePredict} />
      </View>
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => { setModalVisible(false); }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {prediction && <Text style={styles.modalText}>Predicted Ingredient: {prediction}</Text>}
            {error && <Text style={styles.modalText}>{error}</Text>}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={{ ...styles.openButton, backgroundColor: "#2196F3" }} onPress={handleCancel}>
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: '15%'
  },
  predictButtonContainer: {
    marginTop: '10%'
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  modalButtonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
