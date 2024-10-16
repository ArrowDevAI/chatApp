import { TouchableOpacity, StyleSheet, Image, Text, View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { InputToolbar, Bubble, GiftedChat } from 'react-native-gifted-chat';
import CustomActions from './CustomActions';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView from 'react-native-maps';



const Chat = ({ db, route, navigation, isConnected, storage }) => {
  const { user, backgroundColor, userID } = route.params;
  const [messages, setMessages] = useState([]);
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState(null);
  console.log("image:", image)


  const cacheMessages = async (messagesToCache) => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(messagesToCache))
    } catch (error) {
      console.log(error.message)
    }

  };
  const loadCachedMessages = async () => {
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

  const onSendFunction = (messagesToSend, image) => {
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
      messageToSend.image = image.uri;

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
        wrapperStyle={{
          right: {
            backgroundColor: '#000',
          },
          left: {
            backgroundColor: '#FFF',
          },
        }}
      >
        <View style={styles.renderBubbleContainer}>
          <MapNoCloseButton location={currentMessage.location} />
          <Text style={styles.messageText}>{currentMessage.text}</Text>
        </View>
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
          <View style={styles.renderBubbleContainer}>
            <ImageNoCloseButton image={currentMessage.image} />
            <Text style={styles.messageText}>{currentMessage.text}</Text>
          </View>
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


  const ImageWithCloseButton = ({ image, onClosePic }) => {
    return (
      <View style={styles.imageContainer}>
        {image ? (
          <>
            <Image source={{ uri: image.uri }} style={{ width: 200, height: 200 }} />
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
    if (!image) {
      return null;
    }

    return (
      <View style={styles.imageContainer}>
        {image ? (
          <>
            <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
          </>
        ) : (
          <Text style={styles.placeholderText}>No Image data</Text>
        )}
      </View>
    );
  };
  const MapWithCloseButton = ({ location, onCloseMap }) => {
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

  const CustomInputToolbar = (props) => {
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

  const renderInputToolbar = (props) => {
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

  const renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };


  useEffect(() => {

    navigation.setOptions({ title: user === '' ? 'ChatApp User' : user });
  }, [user]);

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor || '#F5F5F5' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -200 : 0}
        style={{ flex: 1 }}
      >
        {/* Adjusted TouchableWithoutFeedback Placement */}
        <View style={styles.giftedChatContainer}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <GiftedChat
              messages={messages}
              renderInputToolbar={renderInputToolbar}
              renderActions={(props) => (
                <CustomActions {...props} setLocation={setLocation} setImage={setImage} storage={storage} userID={userID} />
              )}
              renderBubble={renderBubble}
              onSend={onSendFunction}
              user={{ _id: userID, name: user }}
            />
          </TouchableWithoutFeedback>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};


const styles = StyleSheet.create({
  image: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  giftedChatContainer: {
    padding: 25, // Add 5px padding to the GiftedChat component
    flex: 1, // Ensure it takes up the available space
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
  renderBubbleContainer: {
    width: '50%',             // Set the desired width of the bubble
    borderRadius: 13,         // Rounded corners for aesthetics
    overflow: 'hidden',       // Prevent overflow of child components
    marginBottom: 10,         // Space below the bubble
    backgroundColor: '#FFF',  // Background color for the bubble
    shadowColor: '#000',      // Shadow color for depth
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.1,       // Shadow opacity
    shadowRadius: 4,          // Shadow blur radius
    elevation: 2,             // Elevation for Android shadow effect
    padding: 8,
    alignContent: "center",
    justifyContent: "center"  // Padding around the content
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
