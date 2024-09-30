import React, { useState } from 'react';
import { TouchableOpacity, ImageBackground, StyleSheet, View, Text, TextInput } from 'react-native';
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
            style={[styles.colorCircle, { backgroundColor: color }]} // Removed marginBottom here
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: selectedColor || 'white' }]}>
      <View style={styles.innerContainer}>
        <ImageBackground source={backgroundImage} style={styles.image} resizeMode='cover'>
          <Text style={styles.bgd_text}>Chat App</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder='Your Name'
              placeholderTextColor='white'
            />
            <Text style={styles.colorPickerLabel}>Choose Background Color:</Text>
            <ColorPicker setSelectedColor={setSelectedColor} />
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
    flex: 0.95, // Take up 95% of the parent
    margin: '2.5%', // Center it by giving equal margins on all sides
    borderRadius: 10, // Optional: Add some corner radius for aesthetics
    overflow: 'hidden', // To clip the inner image if necessary
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center content vertically and horizontally
  },
  bgd_text: {
    color: 'white',
    fontSize: 50,
    lineHeight: 84,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#4D4D4D',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    position: 'absolute', // Fixed position for the title
    top: '3%', // Use percentage for positioning
    width: '100%',
  },
  inputContainer: {
    padding: 10,
    paddingTop: 15, // Added 5px more padding from the top
    backgroundColor: 'rgba(128, 128, 128, 0.5)', // 80% transparent grey
    alignSelf: 'center',
    width: '92%',
    position: 'absolute',
    bottom: 30, // Position above the button
    alignItems: 'center', // Center items within the input container
  },
  textInput: {
    width: "88%",
    padding: 15,
    borderWidth: 1,
    marginBottom: 15, // Space between TextInput and ColorPicker
    alignSelf: "center",
    color: "white",
    borderColor: "white",
  },
  button: {
    width: '88%',
    alignSelf: 'center',
    marginTop: 20, // Space between ColorPicker and button
    backgroundColor: "grey",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    padding: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    alignSelf: "center",
  },
  colorContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    width: '88%', 
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    marginHorizontal: 5, // Add horizontal margin to space out buttons
  },
  colorPickerLabel: {
    color: '#D4D4D4',
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    marginBottom: 20, // Space below the color picker label
  },
});

export default Start;
