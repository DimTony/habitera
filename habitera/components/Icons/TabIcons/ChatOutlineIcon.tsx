import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ChatOutlineIcon = ({ width = 14, height = 14, color = '#404040', strokeWidth = 0.8 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 14" fill="none">
      <Path
        d="M12.9759 6.38252C13.008 6.88064 13.008 7.39652 12.9759 7.89464C12.8114 10.44 10.8122 12.4676 8.30236 12.6344C7.4461 12.6913 6.55216 12.6912 5.69764 12.6344C5.40337 12.6148 5.08264 12.5446 4.8064 12.4309C4.49906 12.3043 4.34536 12.241 4.26726 12.2506C4.18916 12.2602 4.07584 12.3438 3.84921 12.5109C3.44961 12.8055 2.9462 13.0172 2.19966 12.999C1.82215 12.9898 1.63341 12.9852 1.5489 12.8412C1.4644 12.6971 1.56964 12.4977 1.78012 12.0988C2.07204 11.5456 2.257 10.9123 1.97674 10.4049C1.49406 9.68006 1.08406 8.8217 1.02414 7.89464C0.991953 7.39652 0.991953 6.88064 1.02414 6.38252C1.18864 3.83713 3.18783 1.80958 5.69764 1.64274C6.41908 1.59478 6.56872 1.58723 7.3 1.62031"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.9972 7.30005H7.0026M9.3945 7.30005H9.3999M4.59991 7.30005H4.6053"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13 3.1C13 4.2598 12.0598 5.2 10.9 5.2C9.74019 5.2 8.79999 4.2598 8.79999 3.1C8.79999 1.9402 9.74019 1 10.9 1C12.0598 1 13 1.9402 13 3.1Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default ChatOutlineIcon;
