import { View, Text, Pressable, StyleSheet } from 'react-native';
import { HomeIcon, MosqueIcon, ClockIcon } from '../components/Icons';
import { C } from '../theme';

interface TabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  descriptors: Record<string, { options: { title?: string } }>;
  navigation: {
    navigate: (name: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emit: (e: any) => any;
  };
}

function iconFor(routeName: string) {
  if (routeName === 'index') return HomeIcon;
  if (routeName === 'mosques') return MosqueIcon;
  return ClockIcon;
}

export default function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  return (
    <View style={s.bar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label =
          typeof options.title === 'string' ? options.title : route.name;
        const color = focused ? C.emerald : C.muted;
        const Icon = iconFor(route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            style={s.tab}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
          >
            <Icon color={color} />
            <Text style={[s.label, { color }]}>{label}</Text>
            <View style={[s.dot, focused && s.dotActive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: C.line,
    height: 88,
    paddingBottom: 14,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  dotActive: {
    backgroundColor: C.gold,
  },
});
