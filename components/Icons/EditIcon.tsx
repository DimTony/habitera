import React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

const EditIcon = ({ width = 13, height = 13, color = 'black', ...props }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 13 13" fill="none" {...props}>
      <Defs>
        <ClipPath id="clip0_449_1311">
          <Rect width="13" height="13" fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0_449_1311)">
        <Path
          d="M5.875 2.14893H2.08333C1.79602 2.14893 1.52047 2.26306 1.3173 2.46623C1.11414 2.66939 1 2.94494 1 3.23226V10.8156C1 11.1029 1.11414 11.3785 1.3173 11.5816C1.52047 11.7848 1.79602 11.8989 2.08333 11.8989H9.66667C9.95398 11.8989 10.2295 11.7848 10.4327 11.5816C10.6359 11.3785 10.75 11.1029 10.75 10.8156V7.02393"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M9.9375 1.33655C10.153 1.12106 10.4453 1 10.75 1C11.0547 1 11.347 1.12106 11.5625 1.33655C11.778 1.55204 11.899 1.8443 11.899 2.14905C11.899 2.4538 11.778 2.74606 11.5625 2.96155L6.41667 8.10738L4.25 8.64905L4.79167 6.48238L9.9375 1.33655Z"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};

export default EditIcon;
