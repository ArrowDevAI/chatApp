import {StyleSheet, Text, View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useEffect, useState } from 'react';
import {InputToolbar, Bubble, GiftedChat } from 'react-native-gifted-chat';
import luka140 from "../assets/luka140.png";
import { collection, onSnapshot, addDoc, query, where, orderBy  } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Chat = ({ db, route, navigation, isConnected }) => {
const { user, backgroundColor, userID } = route.params;
const [messages, setMessages] = useState([]);



const cacheMessages = async (messagesToCache)=>{
  console.log("messages to cache: ", messagesToCache)
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
          id: doc.id,
          ...messageData,
          createdAt: createdAt,  // Include createdAt logic here
        });
      });
      console.log("Messages from Firestore: ", newMessages);
      cacheMessages(newMessages);  // Cache the messages locally
      setMessages(newMessages);    // Update the state with new messages
    });
  } else {
    loadCachedMessages();  // If not connected, load messages from cache
  }

  return () => {
    console.log("Cleaning up... Unsubscribing from Firestore");
    if (unsubMessages) unsubMessages();  // Unsubscribe on cleanup
  };
}, [isConnected]);


  const renderBubble = (props) => {
    return <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: "#000"
        },
        left: {
          backgroundColor: "#FFF"
        }
      }}
    />
  }

  const renderInputToolbar = (props) => {
    if (isConnected) return <InputToolbar {...props} />;
    else return null;
   }
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
                renderBubble = {renderBubble}
                onSend={(messages) =>{ 
                const messageToSend = {...messages[0], createdAt: new Date()};
                addDoc(collection(db, "messages"), messageToSend)} }
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
});

export default Chat;
