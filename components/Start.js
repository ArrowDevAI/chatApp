import { useEffect, useState } from 'react';
import {
  Alert,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import backgroundImage from '../assets/background.png';
import { getAuth, signInAnonymously } from 'firebase/auth';

const Start = ({ route, navigation }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const colors = ['#A9A9A9', '#D3D3D3', '#557a5d', '#162d1b'];

  useEffect(() => {
    navigation.setOptions({ title: "Home" });
  }, []);

  const ColorPicker = () => (
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
  
  const auth = getAuth();
  const signInUser = () => {
    signInAnonymously(auth)
      .then(result => {
        if (result.user.uid)
        navigation.navigate("Chat", { 
      userID: result.user.uid, 
      user: name,
      backgroundColor: selectedColor
    });
        Alert.alert("Signed in Successfully!");
      })
      .catch((error) => {
        Alert.alert("Unable to sign in, try again later.");
      });
      
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <ImageBackground source={backgroundImage} style={styles.image} resizeMode='cover'>
          <Text style={styles.bgd_text}>Chat App</Text>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.inputContainer}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.inputWrapper}>
                <TextInput
                accessible = {true}
                accessibilityHint='Input your name'
                accessibilityLabel='This will be your chat username'
                accessibilityRole='search'
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder='Your Name'
                  placeholderTextColor='white'
                />
                <Text style={styles.colorPickerLabel}>Choose Background Color:</Text>
                <ColorPicker />
                <TouchableOpacity
                  accessible={true}
                  accessibilityLabel='Go Chat Button'
                  accessibilityHint='Brings you to the chat page'
                  accessibilityRole='button'
                  style={[styles.button, { backgroundColor: selectedColor || 'grey' }]}
                  onPress={signInUser}
                >
                  <Text style={styles.buttonText}>Go Chat</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
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
    flex: 0.95,
    margin: '2.5%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    position: 'absolute',
    top: '3%',
    width: '100%',
  },
  inputContainer: {
    padding: 10,
    paddingTop: 15,
    backgroundColor: 'rgba(128, 128, 128, 0.5)',
    alignSelf: 'center',
    width: '92%',
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  inputWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  textInput: {
    width: '88%',
    padding: 15,
    borderWidth: 1,
    marginBottom: 15,
    alignSelf: 'center',
    color: 'white',
    borderColor: 'white',
  },
  button: {
    width: '88%',
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: 'grey',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    padding: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    alignSelf: 'center',
    fontWeight:'bold',
    textShadowColor:'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 15
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
    marginHorizontal: 5,
  },
  colorPickerLabel: {
    color: '#D4D4D4',
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default Start;
