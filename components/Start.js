import React from 'react';
import { TouchableOpacity, ImageBackground, StyleSheet, View, Text, TextInput } from 'react-native';
import { useState } from 'react';
import backgroundImage from '../assets/background.png';

const Start = ({ navigation }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const colors = ['#4D4D4D', '#B5B5B5', '#C9D8D5', '#D4D4D4'];
  const ColorPicker = ({ setSelectedColor }) => {
    return (
      <View style={styles.colorContainer}>
        {colors.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.colorCircle, { backgroundColor: color }]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: selectedColor || 'white' }]}>
      {/* Outer view for color selection */}
      <View style={styles.innerContainer}>
        {/* Inner view for the image */}
        <ImageBackground source={backgroundImage} style={styles.image} resizeMode='cover'>
          <Text style={styles.bgd_text}>Chat App</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.colorPickerLabel}>Choose Background Color:</Text>
            <ColorPicker setSelectedColor={setSelectedColor} />
          </View>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder='Your Name'
            placeholderTextColor='white'
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: selectedColor || 'grey' }]}
              onPress={() => navigation.navigate('Chat', { name: name, selectedColor: selectedColor })}
            >
              <Text style={styles.buttonText}>Start Chatting</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    flex: 0.99, // Take up 95% of the parent
    margin: '2.5%', // Center it by giving equal margins on all sides
    borderRadius: 10, // Optional: Add some corner radius for aesthetics
    position: 'relative', // Set to relative to allow absolute positioning of child elements
  },
 image: {
    flex: 1,
    width: '100%', // Make the image take the full width of the container
    height: '100%', // Make the image take the full height of the container
    justifyContent: 'center',
  },
  bgd_text: {
    color: 'white',
    fontSize: 50,
    lineHeight: 84,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#D3D3D3',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    position: 'absolute', // Keep the title fixed
    top: 30, // Fixed position for the title
    width: '100%',
  },
  textInput: {
    width: "88%",
    padding: 15,
    borderWidth: 1,
    marginTop: 15,
    position: "absolute", // Keep the TextInput fixed
    alignSelf: "center",
    top: 420, // Fixed position for the TextInput
    color: "white",
    borderColor: "white",
  },
  buttonContainer: {
    width: '88%',
    alignSelf: 'center',
    position: "absolute", // Keep the button fixed
    bottom: 40, // Fixed position for the button
    backgroundColor: "grey",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  inputContainer: {
    padding: 10,
    backgroundColor: 'rgba(128, 128, 128, 0.5)', // 80% transparent grey
    alignSelf: 'center',
    width: '92%',
    height: "35%",
    position: 'absolute', // Changed to absolute positioning
    bottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    alignSelf: "center",
    padding: 10,
  },
  colorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 20,
    top: 55,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  colorPickerLabel: {
    color: '#D4D4D4',
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    postions: "fixed",
    top: 55
  
  },
});

export default Start;
