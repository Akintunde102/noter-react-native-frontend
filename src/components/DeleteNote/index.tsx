import * as React from 'react';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import {NavigationContext} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';

function DeleteNote({onClickDeleteNote}) {
  // Contexts
  const navigation = React.useContext(NavigationContext);

  const _onPress = () => {
    onClickDeleteNote();
    navigation?.navigate('Home');
    Alert.alert('Note Successfully deleted');
  };

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <TouchableOpacity onPress={() => _onPress()}>
        <Icon name="delete" size={60} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

export default DeleteNote;
