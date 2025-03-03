import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

interface ParkingLot {
  lot_id: number;
  location: {
    latitude: number;
    longitude: number;
  };
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchedLocation, setSearchedLocation] = useState<any>(null);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]); // New state for parking lots

  const navigation = useNavigation();

  useEffect(() => {
    async function initialize() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      await fetchLots(); // Wait for parking lots to be fetched
    }

    initialize();
  }, []);

  const fetchLots = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_lots')
        .select('lot_id, location') // Include lot_id and location
        .order('lot_id');

      if (error) throw error;

      // Type the data and set it to state
      setParkingLots(data as ParkingLot[]);
    } catch (err) {
      console.error('Fetch lots error:', err);
      Alert.alert('Error', 'Failed to fetch the lots');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        setSearchedLocation({ latitude, longitude });

        if (location) {
          setLocation({
            ...location,
            coords: {
              ...location.coords,
              latitude,
              longitude
            }
          });
        }
      } else {
        setErrorMsg('Location not found');
      }
    } catch (error) {
      setErrorMsg('Error searching location');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : location ? (
        <MapView
          style={styles.map}
          region={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
          showsMyLocationButton
        >
          {/* Markers for parking lots */}
          {parkingLots.map((lot) => (
            <Marker
              key={lot.lot_id}
              coordinate={{
                latitude: lot.location.latitude,
                longitude: lot.location.longitude,
              }}
              title={`Parking ${lot.lot_id}`}
              description="This is a Parking Location"
              onPress={() => navigation.navigate('Visualization', { lotId: lot.lot_id })}
            />
          ))}

          {/* Marker for searched location */}
          {searchedLocation && (
            <Marker
              coordinate={{
                latitude: searchedLocation.latitude,
                longitude: searchedLocation.longitude,
              }}
              title="Searched Location"
              pinColor="blue"
            />
          )}
        </MapView>
      ) : (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 2,
    zIndex: 1,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#4C4C9D',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
});
