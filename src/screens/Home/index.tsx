import * as React from 'react';
import {View, Text, ScrollView, Dimensions} from 'react-native';
import AddNote from '../../components/AddNote';
import storage from '../../localDb';
import {ILocalNote, ILocalNoteSave} from '../../types';
import {TouchableOpacity} from 'react-native-gesture-handler';

function HomeScreen({navigation}) {
  const [notes, setNotes] = React.useState<Partial<ILocalNote[]>>([]);

  const {height: screenHeight, width: screenWidth} = Dimensions.get('screen');

  const getNotes = async () => {
    const ids = await storage.getIdsForKey('notes');
    console.log({ids});
    const res = [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const note = await storage.load({
        key: 'notes',
        id,
      });
      res.push({id, ...note});
    }
    return res;
  };

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getNotes().then((res) => {
        setNotes(res);
      });
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={{flex: 1}}>
      <ScrollView style={{flex: 1}}>
        {notes?.length > 0 ? (
          notes.map((note: ILocalNote | undefined, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: '#fff',
                marginVertical: 5,
                height: screenHeight / 4,
                borderRadius: 5,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.27,
                shadowRadius: 4.65,
                elevation: 6,
                marginHorizontal: 10,
              }}
              onPress={() => {
                navigation.navigate('Editor', {
                  noteID: note.id,
                  isNewNote: false,
                });
              }}>
              <View>
                <Text
                  style={{
                    padding: 20,
                    fontSize: 20,
                  }}>
                  {note.text.substr(0, 50)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View>
            <Text> No Note</Text>
          </View>
        )}
      </ScrollView>
      <View style={{position: 'absolute', bottom: 20, right: 20}}>
        <AddNote />
      </View>
    </View>
  );
}

export default HomeScreen;
