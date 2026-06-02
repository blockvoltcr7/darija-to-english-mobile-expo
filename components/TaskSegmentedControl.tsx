import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ComponentProps } from 'react';

import { GlassSurface } from '@/components/GlassSurface';

export type TaskMode = 'understand' | 'reply';

interface TaskOption {
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: TaskMode;
}

interface TaskSegmentedControlProps {
  disabled?: boolean;
  onChange: (value: TaskMode) => void;
  value: TaskMode;
}

const options: TaskOption[] = [
  {
    description: 'Darija audio to English',
    icon: 'chatbubble-ellipses-outline',
    label: 'Understand',
    value: 'understand',
  },
  {
    description: 'English voice to Darija',
    icon: 'return-up-forward-outline',
    label: 'Reply',
    value: 'reply',
  },
];

export function TaskSegmentedControl({
  disabled = false,
  onChange,
  value,
}: TaskSegmentedControlProps) {
  return (
    <GlassSurface variant="nav" intensity={74} style={styles.shell}>
      <View style={styles.row}>
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              accessibilityLabel={`${option.label}: ${option.description}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected, disabled }}
              disabled={disabled}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                isSelected ? styles.optionSelected : null,
                pressed && !disabled ? styles.optionPressed : null,
              ]}
            >
              <Ionicons
                name={option.icon}
                size={18}
                color={isSelected ? '#171717' : '#F4F1EA'}
              />
              <View style={styles.copy}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.label,
                    isSelected ? styles.labelSelected : null,
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.description,
                    isSelected ? styles.descriptionSelected : null,
                  ]}
                >
                  {option.description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  shell: {
    padding: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  option: {
    alignItems: 'center',
    borderRadius: 18,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 58,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  optionSelected: {
    backgroundColor: '#C4BBB0',
  },
  optionPressed: {
    opacity: 0.82,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: '#F4F1EA',
    fontSize: 13,
    fontWeight: '900',
  },
  labelSelected: {
    color: '#171717',
  },
  description: {
    color: '#A6A19A',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  descriptionSelected: {
    color: '#3A332C',
  },
});
