import { BathIcon, BedIcon, LocationPin, TrashIcon } from 'components/Svg';
import React from 'react'
import { Text, View } from 'react-native';
import { Image, TouchableOpacity } from 'react-native';

const PropertyItem = () => {
  return (
    <>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          backgroundColor: '#fff',
          paddingHorizontal: 8,
          paddingVertical: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          gap: 10,
          borderRadius: 18,
          marginBottom: 16,
        }}>
        <Image
          source={require('../../../assets/images/onboarding-3.png')}
          style={{
            width: '35%',
            height: 130,
            borderRadius: 18,
            // marginBottom: 12,
            backgroundColor: '#f0f0f0',
          }}
        />

        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            paddingVertical: 5,
            paddingHorizontal: 5,
          }}>
          <Text style={{ fontFamily: 'Bahnschrift', fontSize: 16 }}>Clement</Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <LocationPin />
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{
                fontFamily: 'Bahnschrift',
                fontWeight: '300',
                fontSize: 12,
                color: '#818181',
                flexShrink: 1,
              }}>
              19. Adeniran Ogunsanya Street, Surulere, Lagos
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <BedIcon />
              <Text style={{ fontSize: 11, color: '#818181', fontFamily: 'Bahnschrift' }}>2</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <BathIcon />
              <Text style={{ fontSize: 11, color: '#818181', fontFamily: 'Bahnschrift' }}>2</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ gap: 5 }}>
              <Text style={{ fontSize: 10, color: '#818181', fontFamily: 'Bahnschrift' }}>
                Price
              </Text>
              <Text style={{ fontFamily: 'Bahnschrift', fontSize: 14 }}>#1,200,000/year</Text>
            </View>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: 'gray',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 15, // Changed from '100%' to numeric value
                width: 30,
                height: 30,
              }}>
              <TrashIcon />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
}

export default PropertyItem