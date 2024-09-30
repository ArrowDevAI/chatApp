import { StyleSheet, View, Text } from 'react-native';
import { useEffect } from 'react';

const Chat = ({route, navigation}) => {
    const {name, selectedColor} = route.params;

    useEffect(() => {
        navigation.setOptions({ title: name });
      }, []);
      
 return (
<View style={[styles.container, { backgroundColor: selectedColor || 'white' }]}>
     <Text>Hello</Text>
   </View>
 );
}

const styles = StyleSheet.create({
 container: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center'
 },
});

export default Chat;