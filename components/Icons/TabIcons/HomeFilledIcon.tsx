import React from 'react';
import Svg, { Path } from 'react-native-svg';

const HomeFilledIcon = ({ width = 14, height = 14, color = '#678B83', strokeWidth = 0.8 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
      <Path
        d="M1.21083 7.7281C0.999022 6.34972 0.893116 5.66058 1.1537 5.04963C1.41428 4.43867 1.99242 4.02066 3.14868 3.18464L4.01259 2.56C5.45097 1.52 6.17015 1 7.00001 1C7.82981 1 8.54903 1.52 9.98741 2.56L10.8513 3.18464C12.0076 4.02066 12.5857 4.43867 12.8463 5.04963C13.1069 5.66058 13.001 6.34972 12.7892 7.7281L12.6086 8.90344C12.3083 10.8573 12.1582 11.8343 11.4574 12.4172C10.7567 13 9.73217 13 7.68329 13H6.31673C4.2678 13 3.24335 13 2.5426 12.4172C1.84185 11.8343 1.69172 10.8573 1.39146 8.90344L1.21083 7.7281Z"
        fill={color}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path
        d="M5.19964 13L5.04926 10.8947C4.96841 9.76281 5.86486 8.80005 6.99964 8.80005C8.13442 8.80005 9.03088 9.76281 8.95 10.8947L8.79964 13"
        fill={color}
      />
      <Path
        d="M5.19964 13L5.04926 10.8947C4.96841 9.76281 5.86486 8.80005 6.99964 8.80005C8.13442 8.80005 9.03088 9.76281 8.95 10.8947L8.79964 13"
        stroke="white"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default HomeFilledIcon;
