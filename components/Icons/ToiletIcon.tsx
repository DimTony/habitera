import Svg, { Path } from 'react-native-svg';

const ToiletIcon = ({ width = 9, height = 11, color = '#818181' }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 9 11" fill="none">
      <Path
        d="M2.80005 5.05005H6.91084C7.57009 5.05005 7.89972 5.05005 8.09875 5.38093C8.29779 5.71182 8.18056 5.92273 7.94611 6.34465C7.48081 7.18215 6.57802 7.75005 5.54059 7.75005C4.84557 7.75005 4.21093 7.49512 3.72786 7.07505"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.8 5.05V1.9C2.8 1.47574 2.8 1.26361 2.6682 1.1318C2.53639 1 2.32426 1 1.9 1C1.47574 1 1.26361 1 1.1318 1.1318C1 1.26361 1 1.47574 1 1.9V5.05C1 5.47426 1 5.68639 1.1318 5.81819C1.26361 5.95 1.47574 5.95 1.9 5.95C2.32426 5.95 2.53639 5.95 2.6682 5.81819C2.8 5.68639 2.8 5.47426 2.8 5.05Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M2.3501 3.25H3.7001" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M6.4 7.74995C5.95 8.19995 6.4 9.54995 7.29982 9.99995H1C1.45 9.54995 2.215 8.10995 1.675 5.94995"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ToiletIcon;
