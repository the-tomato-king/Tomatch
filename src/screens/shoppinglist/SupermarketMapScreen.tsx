// import React, { useState } from 'react';
// import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { ShoppingStackParamList } from '../../types/navigation';
// import DynamicMap, { Place } from '../../components/DynamicMap';
// import { colors } from '../../theme/colors';

// const SupermarketMapScreen = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<ShoppingStackParamList>>();
//   const [selectedSupermarket, setSelectedSupermarket] = useState<Place | null>(null);
  
//   // Handle supermarket selection from the map
//   const handleSelectSupermarket = (place: Place) => {
//     setSelectedSupermarket(place);
//   };

//   // Confirm selection and return to previous screen
//   const handleConfirmSelection = () => {
//     if (selectedSupermarket) {
//       navigation.navigate('AddShoppingList', {
//         selectedLocation: {
//             name: selectedSupermarket.name,
//             address: selectedSupermarket.vicinity,
//             latitude: selectedSupermarket.geometry.location.lat,
//             longitude: selectedSupermarket.geometry.location.lng
//         }
//       });
//     } else {
//       alert('Please select a supermarket');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <DynamicMap
//         placeType="supermarket"
//         radius={5000}
//         onPlaceSelect={handleSelectSupermarket}
//         apiKey={process.env.GOOGLE_MAPS_API_KEY}
//         selectedPlace={selectedSupermarket}
//       />
      
//       <View style={styles.selectionContainer}>
//         <Text style={styles.selectionText}>
//           {selectedSupermarket ? 
//             `Selected: ${selectedSupermarket.name}, ${selectedSupermarket.vicinity}` : 
//             'Tap on a supermarket to select it'}
//         </Text>
//         <TouchableOpacity 
//           style={[
//             styles.confirmButton, 
//             !selectedSupermarket && styles.disabledButton
//           ]} 
//           onPress={handleConfirmSelection}
//           disabled={!selectedSupermarket}
//         >
//           <Text style={styles.confirmButtonText}>Confirm Selection</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   selectionContainer: {
//     position: 'absolute',
//     bottom: 20,
//     left: 20,
//     right: 20,
//     backgroundColor: 'white',
//     padding: 15,
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   selectionText: {
//     fontSize: 16,
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   confirmButton: {
//     backgroundColor: colors.primary,
//     padding: 15,
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   disabledButton: {
//     backgroundColor: '#cccccc',
//   },
//   confirmButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default SupermarketMapScreen;

import React from "react";
import { View, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";

const SupermarketMapScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <Text>Supermarket Map</Text>
      {/* <MapView
        style={{ flex: 1 }}
        provider="google"
        initialRegion={{
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        apiKey="AIzaSyCS7TUO7ZdUjsJnbORK06HD2ZawhhsEwPU"
      >
        <Marker coordinate={{ latitude: 37.7749, longitude: -122.4194 }} title="Supermarket" />
      </MapView> */}
      
    </View>
  );
};

export default SupermarketMapScreen;
