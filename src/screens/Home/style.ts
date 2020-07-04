import {StyleSheet, Dimensions} from 'react-native';

const {height: screenHeight} = Dimensions.get('screen');
const Styles = {
  note: {
    backgroundColor: '#fff',
    marginVertical: 5,
    height: screenHeight / 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 2,
    marginHorizontal: 10,
  },
  noteText: {
    flex: 1,
    padding: 20,
    fontSize: 20,
  },
  noteContentView: {
    flex: 1,
  },
  noNotes: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
};

export default StyleSheet.create(Styles);
