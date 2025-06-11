import Svg, { Path } from 'react-native-svg';

const BedIcon = ({ width = 12, height = 11, color = '#818181' }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 12 11" fill="none">
      <Path d="M11 8.25H1" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M11 10V7.5C11 6.5572 11 6.0858 10.7071 5.7929C10.4142 5.5 9.9428 5.5 9 5.5H3C2.05719 5.5 1.58578 5.5 1.29289 5.7929C1 6.0858 1 6.5572 1 7.5V10"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 5.5V4.8089C8 4.55515 7.95425 4.47027 7.7198 4.37025C7.23155 4.16195 6.6389 4 6 4C5.3611 4 4.76844 4.16195 4.2802 4.37025C4.04577 4.47027 4 4.55515 4 4.8089V5.5"
        stroke={color}
        strokeLinecap="round"
      />
      <Path
        d="M1.5 5.5V4C1.5 3.2929 1.5 2.93934 1.71967 2.71967C1.93934 2.5 2.2929 2.5 3 2.5C3.13737 2.5 3.32843 2.53636 3.45141 2.47006C3.50695 2.44013 3.55674 2.36444 3.65634 2.21308C4.1346 1.48623 5.1123 1 6 1C6.8877 1 7.8654 1.48623 8.34365 2.21308C8.44325 2.36444 8.49305 2.44013 8.5486 2.47006C8.6716 2.53636 8.8626 2.5 9 2.5C9.7071 2.5 10.0606 2.5 10.2803 2.71967C10.5 2.93934 10.5 3.2929 10.5 4V5.5"
        stroke={color}
      />
    </Svg>
  );
};

export default BedIcon;
