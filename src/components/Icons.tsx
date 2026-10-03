import Svg, { Path, Circle } from 'react-native-svg';
import type { ColorValue } from 'react-native';

function Base({ children, size = 24, color }: { children: React.ReactNode; size?: number; color: ColorValue }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </Svg>
  );
}

export function HomeIcon({ color }: { color: ColorValue }) {
  return (
    <Base color={color}>
      <Path d="M3 10.5 12 3l9 7.5" />
      <Path d="M5 9.5V21h14V9.5" />
    </Base>
  );
}

export function MosqueIcon({ color }: { color: ColorValue }) {
  return (
    <Base color={color}>
      <Path d="M12 3v2" />
      <Path d="M7 13c0-3.5 2.2-6 5-6s5 2.5 5 6" />
      <Path d="M4 13h16v8H4z" />
      <Circle cx="12" cy="17" r="1.4" fill={color} stroke="none" />
    </Base>
  );
}

export function ClockIcon({ color }: { color: ColorValue }) {
  return (
    <Base color={color}>
      <Circle cx="12" cy="12" r="8.5" />
      <Path d="M12 7.5V12l3 2" />
    </Base>
  );
}
