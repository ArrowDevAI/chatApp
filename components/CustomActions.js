import {React} from 'react';
import {Alert, TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker'; 
import * as Location from 'expo-location';

const CustomActions = ({ wrapperStyle, iconTextStyle, setLocation, setImage}) => {
  
    const getLocation = async () => {
    let permissions = await Location.requestForegroundPermissionsAsync();
    if (permissions?.granted) {
      const loc = await Location.getCurrentPositionAsync({});
      if (loc) {
        const fetchedLocation = ({
          location: {
            longitude: loc.coords.longitude,
            latitude: loc.coords.latitude,
          },
        });
        setLocation(fetchedLocation);
  
      } else Alert.alert("Error occurred while fetching location");
    } else Alert.alert("Permissions haven't been granted.");
  }

  
  const pickImage = async () => {

    try {
      let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissions?.granted) {
        let imagePicked = await ImagePicker.launchImageLibraryAsync();
        if (!imagePicked.canceled) {
          setImage(imagePicked);
       
        }
      } else {
        Alert.alert("Permissions haven't been granted.");
        setImage(null); 
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("An error occurred while picking the image.");
      setImage(null); 
    }
    


  };
  
const takePhoto = async () => {
  let permissions = await ImagePicker.requestCameraPermissionsAsync();

  if (permissions?.granted) {
    let result = await ImagePicker.launchCameraAsync();

    if (!result.canceled) setImage(result.assets[0]);
    else setImage(null)
  }
}
    const actionSheet = useActionSheet();
    const onActionPress = () => {
        const options = ['CHOOSE PHOTO', 'CAMERA', 'LOCATION', 'CANCEL'];
        const cancelButtonIndex = options.length - 1;
        actionSheet.showActionSheetWithOptions(
            {
              options,
              cancelButtonIndex,
            },
            async (buttonIndex) => {
              switch (buttonIndex) {
                case 0:
                  pickImage();
                  return;
                case 1:
                  takePhoto();
                  return;
                case 2:
                  getLocation();
                default:
              }
            },
          );
        
        
      }

  return (
    <TouchableOpacity style={styles.container} onPress={onActionPress}>
          <View style={[styles.wrapper, wrapperStyle]}>
        <Text style={[styles.iconText, iconTextStyle]}>+</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    container: {
        width: 26,
        height: 26,
        marginLeft: 10,
        marginBottom: 10,
      },
      wrapper: {
        borderRadius: 13,
        borderColor: '#b2b2b2',
        borderWidth: 2,
        flex: 1,
      },
      iconText: {
        color: '#b2b2b2',
        fontWeight: 'bold',
        fontSize: 15,
        backgroundColor: 'transparent',
        textAlign: 'center',
        marginTop: 1
      },
});

export default CustomActions;



