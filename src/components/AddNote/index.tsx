import * as React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {NavigationContext} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';

function AddNote() {
  // Contexts
  const navigation = React.useContext(NavigationContext);

  const onClickChangeNote = () => {
    navigation?.navigate('Editor');
  };

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <TouchableOpacity onPress={onClickChangeNote}>
        <Icon name="pluscircle" size={60} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

export default AddNote;
