import {StyleSheet, Text, View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useEffect, useState } from 'react';
import {Bubble, GiftedChat } from 'react-native-gifted-chat';
import luka140 from "../assets/luka140.png";
import { collection, onSnapshot, addDoc, query, orderBy  } from 'firebase/firestore';

const Chat = ({ db, route, navigation }) => {
  console.log("ROUTE:", route.params)
  const { user, backgroundColor, userID } = route.params;
  const [messages, setMessages] = useState([]);


  const handleInputTextChanged = (text) => {
    setIsTyping(text.length>0)
  };

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

  useEffect(() => {

    navigation.setOptions({ title: user === ''? 'ChatApp User' : user });
  }, [user]);


  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubMessages = onSnapshot(q, (documentsSnapshot) => {
        let messages = [];
        documentsSnapshot.forEach(doc => {
          const messageData = doc.data();
          const createdAt = messageData.createdAt?.toDate() || new Date();
            messages.push({ 
              id: doc.id, ...messageData,
              createdAt:createdAt
             });
        });
        setMessages(messages);
    });
    console.log("Unsubscribe function: ", unsubMessages);
    
    return () => {
        console.log("Cleaning up... Unsubscribing from Firestore");
        if (unsubMessages) unsubMessages(); 
    };
}, []);
  

  return (
      <View style={[styles.container, { backgroundColor: backgroundColor || '#F5F5F5' }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? -200 : 0} // Adjusted value for more space above the keyboard
          style={{ flex: 1 }} // Make sure the KeyboardAvoidingView takes up the full height
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.giftedChatContainer}>
              <GiftedChat
                messages={messages}
                renderBubble = {renderBubble}
                onSend={(messages) =>{ 
                  const messageToSend = {...messages[0], createdAt: new Date(), isTyping: false};
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
