import React from 'react';
import Svg, { Path } from 'react-native-svg';

const BookmarkOutlineIcon = ({ width = 13, height = 14, color = '#404040', strokeWidth = 0.8 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 13 14" fill="none">
      <Path
        d="M6.4 13C3.85442 13 2.58162 13 1.79081 12.1213C1 11.2426 1 9.82845 1 6.99999C1 4.17157 1 2.75736 1.79081 1.87868C2.58162 1 3.85442 1 6.4 1C8.94556 1 10.2184 1 11.0092 1.87868C11.8 2.75736 11.8 4.17157 11.8 6.99999C11.8 9.82845 11.8 11.2426 11.0092 12.1213C10.2184 13 8.94556 13 6.4 13Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 1.2998V5.69553C4 6.44378 4 6.81795 4.23185 6.95187C4.68084 7.21119 5.52304 6.34598 5.923 6.08546C6.15496 5.93438 6.27094 5.85884 6.4 5.85884C6.52906 5.85884 6.64504 5.93438 6.877 6.08546C7.27696 6.34598 8.11918 7.21119 8.56816 6.95187C8.8 6.81795 8.8 6.44378 8.8 5.69553V1.2998"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default BookmarkOutlineIcon;
