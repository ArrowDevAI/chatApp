import { TouchableOpacity, StyleSheet, Image, Text, View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { InputToolbar, Bubble, GiftedChat } from 'react-native-gifted-chat';
import CustomActions from './CustomActions';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView from 'react-native-maps';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';



const Chat = ({ db, route, navigation, isConnected, storage }) => {
  
  const { user, backgroundColor, userID } = route.params;
  const [messages, setMessages] = useState([]);
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState(null);

  const cacheMessages = async (messagesToCache) => { //cacheMessages in AsyncStorage must store as string
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(messagesToCache))
    } catch (error) {
      console.log(error.message)
    }

  };
  const loadCachedMessages = async () => { //function to be run if Firestore connection doesn't exist. Reqquires parsing
    const cachedMessages = await AsyncStorage.getItem('messages');
    if (cachedMessages) { setMessages(JSON.parse(cachedMessages)) }
    else {
      console.log("No Cached Messages Found")
    }
  }

  useEffect(() => {
    let unsubMessages;

    if (isConnected === true) {
      if (unsubMessages) unsubMessages();
      unsubMessages = null;

      const q = query(
        collection(db, "messages"),
        orderBy("createdAt", "desc")
      );

      unsubMessages = onSnapshot(q, (documentsSnapshot) => {

        console.log("Firestore connection established. Listening for updates...");
        let newMessages = [];
        documentsSnapshot.forEach((doc) => {
          const messageData = doc.data();
          const createdAt = messageData.createdAt?.toDate() || new Date();
          newMessages.push({
            _id: doc.id,
            ...messageData,
            createdAt: createdAt,
            location: messageData.location || null,
            image: messageData.image || null
          });
        });
        cacheMessages(newMessages);
        setMessages(newMessages);
      });
    } else {
      loadCachedMessages();
    }

    return () => {
      console.log("Cleaning up... Unsubscribing from Firestore");
      if (unsubMessages) unsubMessages();  // Unsubscribe on cleanup
    };
  }, [isConnected]);

  const onSendFunction = async (messagesToSend, storage) => { //image is set in CustomActions pickImage or takePhoto components. Loaded and retrived from storage here and attached to message.
    const messageToSend = {
      ...messagesToSend[0],
      createdAt: new Date(),
    };

    if (location) {
      messageToSend.location = {
        latitude: location.location.latitude,
        longitude: location.location.longitude,
      };
    }

    if (image) {
      const generateReference = (uri) => {
        const timeStamp = (new Date()).getTime();
        const imageName = uri.split("/")[uri.split("/").length - 1];
        return `${userID}-${timeStamp}-${imageName}`;
      }
     
    try {
      const imageURI = image.assets[0].uri
      const uniqueRefString = generateReference(imageURI);
      const response = await fetch(imageURI);
      const blob = await response.blob();
      const newUploadRef = ref(storage, uniqueRefString);
      const snapshot = await uploadBytes(newUploadRef, blob);
      console.log('Image uploaded');

      // Get the download URL and attach it to the message
      const imageURL = await getDownloadURL(snapshot.ref);
      messageToSend.image = imageURL;

    } catch (error) {
      console.error("Error uploading image:", error);
      return;  // Optionally handle failure
    }
    }


    addDoc(collection(db, "messages"), messageToSend)
      .then(() => {
        console.log("Message sent successfully");
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });

    setLocation(null);
    setImage(null);
  };

  const renderBubble = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <Bubble
        {...props}
   
        renderCustomView={() => (
          <View style={{ width: 150, height: 150, margin: 5 }}>
          <MapNoCloseButton location={currentMessage.location} />
        </View>
        )}
        wrapperStyle={{
          right: {
            backgroundColor: '#000',
          },
          left: {
            backgroundColor: '#FFF',
          },
        }}
      >

        </Bubble>

      );
    }

    if (currentMessage.image) {
      return (
        <Bubble
          {...props}
          wrapperStyle={{
            right: {
              backgroundColor: '#000',
            },
            left: {
              backgroundColor: '#FFF',
            },
          }}
          
        >
            {/* <ImageNoCloseButton image={currentMessage.image} /> */}
            renderCustomImage={() => (
          <View style={{ width: 150, height: 150, margin: 5 }}>
          <ImageNoCloseButton image={currentMessage.image} />
        </View>
        )}

        </Bubble>
      );
    }

    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#000',
          },
          left: {
            backgroundColor: '#FFF',
          },
        }}
      />
    );
  };


  const ImageWithCloseButton = ({ image, onClosePic }) => { //used to temoorarily render image in text input toolbar
    const imageURI = image.assets[0].uri
    return (
      <View style={styles.imageContainer}>
        {image ? (
          <>
            <Image source={{uri: imageURI}} style={{ width: 200, height: 200 }} />
            <TouchableOpacity style={styles.closeButton} onPress={onClosePic}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.placeholderText}>No Image data</Text>
        )}
      </View>
    );
  };
  const ImageNoCloseButton = ({ image }) => {
    const imageURI = image.assets[0].uri

    if (!image) {
      return null;
    }

    return (
      <View style={styles.imageContainer}>
        {image ? (
          <>
            <Image source={{ uri: imageURI }} style={{ width: 200, height: 200 }} />
          </>
        ) : (
          <Text style={styles.placeholderText}>No Image data</Text>
        )}
      </View>
    );
  };
  const MapWithCloseButton = ({ location, onCloseMap }) => {//used to temoorarily render map in text input toolbar
    return (
      <View style={styles.mapContainer}>
        {location ? (
          <>
            <MapView
              style={styles.map}
              region={{
                latitude: location.location.latitude,
                longitude: location.location.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            />
            <TouchableOpacity style={styles.closeButton} onPress={onCloseMap}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.placeholderText}>No location data</Text>
        )}
      </View>
    );
  };
  const MapNoCloseButton = ({ location }) => {
    if (!location || !location.latitude || !location.longitude) {
      return (
        <View style={styles.mapContainer}>
          <Text style={styles.placeholderText}>No location data</Text>
        </View>
      );
    }

    return (
      <TouchableWithoutFeedback>
        <View style={styles.mapContainer}>
          <MapView
            scrollEnabled={false} // Disable map scroll
            zoomEnabled={false}    // Disable map zoom
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const onCloseMap = () => {
    setLocation(null);
  };
  const onClosePic = () => {
    setImage(null)
  }

  const CustomInputToolbar = (props) => { // 
    const { image, location, onClosePic, onCloseMap } = props;
    return (
      <View style={styles.inputToolbarContainer}>
        {location && (
          <View style={styles.mapInToolbar}>
            <MapWithCloseButton location={location} onCloseMap={onCloseMap} />
          </View>
        )}

        {image && (
          <View style={styles.imageInToolbar}>
            <ImageWithCloseButton image={image} onClosePic={onClosePic} />
          </View>
        )}
        <InputToolbar {...props} />
      </View>
    );
  };

  const renderInputToolbar = (props) => { //conditional rendering of toolbar based on connection to database
    if (isConnected) {
      return (
        <CustomInputToolbar {...props} 
        location={location} 
        onCloseMap={onCloseMap} 
        image={image} 
        onClosePic={onClosePic} 
        onSendFunction = {onSendFunction} />
      );
    } else {
      return null;
    }
  };

  useEffect(() => {

    navigation.setOptions({ title: "ChatApp" });
  }, [user]);

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor || '#F5F5F5' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -200 : 0}
        style={{ flex: 1 }}
      >
       
        <View style={styles.giftedChatContainer}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <GiftedChat
              messages={messages}
              renderInputToolbar={renderInputToolbar}
              renderActions={(props) => (
                <CustomActions {...props} setLocation={setLocation} setImage={setImage} />
              )}
              renderBubble={renderBubble} 
              onSend={(messages) => onSendFunction(messages, storage)}
              user={{ _id: userID, name: user }}
            />
          </TouchableWithoutFeedback>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};


const styles = StyleSheet.create({

  container: {
    flex: 1,
  },
  giftedChatContainer: {
    padding: 5, 
    flex: 1, 
  },
  mapContainer: {
    width: '100%',
    height: 150,
    borderRadius: 13,
    overflow: 'hidden',
    marginBottom: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapInToolbar: {
    marginBottom: 5,
    marginTop: 5,
    marginLeft: 5,
    marginRight: 5
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputToolbarContainer: {
    backgroundColor: 'white',
    marginBottom: 20,
    marginLeft: 15,
    marginRight:15
  },
  imageContainer: {
    width: '50%',
    height: 150,
    borderRadius: 13,
    overflow: 'hidden',
    marginBottom: 10,
    justifyContent: "center"
  },
  imageInToolbar: {
    width: '100%',
    height: 150,
    borderRadius: 13,
    overflow: 'hidden',
    marginBottom: 15,
    marginTop: 15,
    marginLeft: 15,
    marginRight: 15
  },
});

export default Chat;
