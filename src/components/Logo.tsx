import Svg, { Path, Circle, Line, G, Rect } from 'react-native-svg';

export default function Logo({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Rect x="2" y="2" width="60" height="60" rx="16" fill="#0C5C40" />
      <Path
        d="M26,15 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0 M30.6,12.3 a5.6,5.6 0 1,1 11.2,0 a5.6,5.6 0 1,1 -11.2,0"
        fillRule="evenodd"
        fill="#C6A15B"
      />
      <G stroke="#C6A15B" strokeWidth="2.6" strokeLinecap="round" fill="none">
        <Line x1="13.5" y1="29" x2="13.5" y2="50" />
        <Path d="M10.3 29 Q13.5 22.3 16.7 29" />
        <Line x1="50.5" y1="29" x2="50.5" y2="50" />
        <Path d="M47.3 29 Q50.5 22.3 53.7 29" />
      </G>
      <Path
        d="M20 40 C20 31 25 26.5 32 26.5 C39 26.5 44 31 44 40"
        fill="none"
        stroke="#F7F4EC"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <Path
        d="M32 36.5 c-4.2 0 -7.4 3.2 -7.4 7.4 c0 5.3 7.4 11.6 7.4 11.6 c0 0 7.4 -6.3 7.4 -11.6 c0 -4.2 -3.2 -7.4 -7.4 -7.4 Z"
        fill="#0C5C40"
        stroke="#C6A15B"
        strokeWidth="2.6"
      />
      <Circle cx="32" cy="44" r="2.6" fill="#C6A15B" />
    </Svg>
  );
}
