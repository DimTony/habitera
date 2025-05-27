import React from 'react';
import Svg, { Path } from 'react-native-svg';

const MapSearchIcon = ({
  width = 26,
  height = 26,
  primaryColor = 'white',
  secondaryColor = '#B9B9B9',
  strokeWidth = 1.5,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 26 26" fill="none">
      <Path
        d="M11 15.5H11.009"
        stroke={primaryColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19 7V12C19 15.7712 19 17.6569 17.8284 18.8284C16.6569 20 14.7712 20 11 20C7.22876 20 5.34315 20 4.17157 18.8284C3 17.6569 3 15.7712 3 12V7"
        stroke={primaryColor}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M21 9L16.6569 4.83548C13.9902 2.27849 12.6569 1 11 1C9.3431 1 8.00981 2.27849 5.34315 4.83548L1 9"
        stroke={primaryColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M20.75 21.25L21.625 22.125"
        stroke={primaryColor}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21.8777 23.598C21.5408 23.261 21.5408 22.7147 21.8777 22.3777C22.2147 22.0408 22.761 22.0408 23.098 22.3777L24.2889 23.5686C24.6259 23.9056 24.6259 24.452 24.2889 24.7889C23.952 25.1259 23.4056 25.1259 23.0686 24.7889L21.8777 23.598Z"
        stroke={primaryColor}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21.625 18.0416C21.625 15.7864 19.7968 13.9583 17.5416 13.9583C15.2865 13.9583 13.4583 15.7864 13.4583 18.0416C13.4583 20.2968 15.2865 22.1249 17.5416 22.1249C19.7968 22.1249 21.625 20.2968 21.625 18.0416Z"
        fill={secondaryColor}
        stroke={primaryColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default MapSearchIcon;
