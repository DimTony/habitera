import Svg, { Path } from 'react-native-svg';

const SwitchIcon = () => {
  return (
    <Svg width="15" height="18" viewBox="0 0 15 18" fill="none">
      <Path
        opacity="0.8"
        d="M11 1L14 4L11 7"
        stroke="#678B83"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        opacity="0.8"
        d="M1 8V6.66667C1 5.95942 1.30436 5.28115 1.84614 4.78105C2.38791 4.28095 3.12271 4 3.88889 4H14"
        stroke="#678B83"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        opacity="0.8"
        d="M4 17L1 14L4 11"
        stroke="#678B83"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        opacity="0.8"
        d="M14 10V11.3333C14 12.0406 13.6956 12.7189 13.1539 13.219C12.6121 13.719 11.8773 14 11.1111 14H1"
        stroke="#678B83"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};

export default SwitchIcon;
