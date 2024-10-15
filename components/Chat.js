import {TouchableOpacity, StyleSheet, Image, Text, View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useEffect, useState } from 'react';
import {InputToolbar, Bubble, GiftedChat } from 'react-native-gifted-chat';
import CustomActions from './CustomActions';
import luka140 from "../assets/luka140.png";
import { collection, onSnapshot, addDoc, query, orderBy  } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView from 'react-native-maps';



const Chat = ({ db, route, navigation, isConnected }) => {
const { user, backgroundColor, userID } = route.params;
const [messages, setMessages] = useState([]);
const [location, setLocation] = useState(null);
const [image, setImage] = useState(null);


const cacheMessages = async (messagesToCache)=>{
try {
  await AsyncStorage.setItem('messages', JSON.stringify(messagesToCache))
}catch (error){
  console.log(error.message)
}

};
const loadCachedMessages = async ()=>{
  const cachedMessages = await AsyncStorage.getItem('messages');
 if (cachedMessages){setMessages(JSON.parse(cachedMessages))}
 else{
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

const onSendFunction = (messagesToSend) => {
  const messageToSend = {
    ...messagesToSend[0],
    createdAt: new Date(),
  };

  // Check if location data exists
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
    return <MapNoCloseButton location={currentMessage.location} />;
  }
  if (currentMessage.image) {
    return <ImageNoCloseButton image={currentMessage.image} />;
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

const ImageWithCloseButton = ({ image, onClosePic}) => {
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
const ImageNoCloseButton = ({ image}) => {
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
    return null; 
  }
    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      </View>
    );
  };
  const onCloseMap = () => {
    setLocation(null);
  };
  const onClosePic = () =>{
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
        <CustomInputToolbar {...props} location={location} onCloseMap={onCloseMap} image={image} onClosePic={ onClosePic}/>
      );
    } else {
      return null;
    }
  };

   const renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };


  useEffect(() => {

    navigation.setOptions({ title: user === ''? 'ChatApp User' : user });
  }, [user]);

  return (
      <View style={[styles.container, { backgroundColor: backgroundColor || '#F5F5F5' }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? -200 : 0} 
          style={{ flex: 1 }} 
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.giftedChatContainer}>
              <GiftedChat
                messages={messages}
                renderInputToolbar={renderInputToolbar} 
                renderActions={(props) => (
                  <CustomActions {...props} setLocation={setLocation} setImage={setImage} /> 
                )}
                renderBubble = {renderBubble}
                onSend={onSendFunction}
                user={{_id: userID, name: user }}
              />
            </View>
          </TouchableWithoutFeedback>
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
    width: '50%',
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
  },
  imageContainer: {
    width: '50%',
    height: 150,
    borderRadius: 13,
    overflow: 'hidden',
    marginBottom: 10,
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
