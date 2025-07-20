import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, TextInputProps } from 'react-native';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

// Custom EditIcon component
const EditIcon = ({ width = 20, height = 20, color = '#636363' }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 13 13" fill="none">
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

// Custom CheckIcon component
const CheckIcon = ({ width = 20, height = 20, color = '#4CAF50' }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

interface EditableFieldProps extends Omit<TextInputProps, 'onChangeText' | 'onBlur' | 'value'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  initiallyEditable?: boolean;
  onEditStart?: () => void;
  onEditEnd?: () => void;
}

const EditableInput: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  disabled = false,
  initiallyEditable = false,
  onEditStart,
  onEditEnd,
  placeholder,
  ...textInputProps
}) => {
  const [isEditable, setIsEditable] = useState(initiallyEditable);

  const toggleEditMode = () => {
    if (disabled) return;

    if (isEditable) {
      // Switching from edit to read mode
      setIsEditable(false);
      onEditEnd?.();
    } else {
      // Switching from read to edit mode
      setIsEditable(true);
      onEditStart?.();
    }
  };

  const handleBlur = () => {
    onBlur?.();
    // Optionally auto-disable editing on blur
    // setIsEditable(false);
    // onEditEnd?.();
  };

  const hasError = touched && error;

  return (
    <View style={[styles.fieldSet, hasError ? styles.fieldSetError : {}]}>
      <Text style={[styles.legend, hasError ? styles.legendError : {}]}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.textInput,
            !isEditable && styles.textInputReadOnly,
            disabled && styles.textInputDisabled,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          onBlur={handleBlur}
          editable={isEditable && !disabled}
          selectTextOnFocus={isEditable}
          {...textInputProps}
        />
        {!disabled && (
          <TouchableOpacity
            style={styles.editIcon}
            onPress={toggleEditMode}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            {isEditable ? <CheckIcon color="#4CAF50" /> : <EditIcon color="#636363" />}
          </TouchableOpacity>
        )}
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldSet: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: '#fff',
    position: 'relative',
  },
  fieldSetError: {
    borderColor: '#FF3B30',
  },
  legend: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#fff',
    color: '#636363',
    fontSize: 12,
    paddingHorizontal: 6,
    fontWeight: '500',
  },
  legendError: {
    color: '#FF3B30',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    paddingRight: 40,
  },
  textInputReadOnly: {
    color: '#666',
    backgroundColor: 'transparent',
  },
  textInputDisabled: {
    color: '#999',
    backgroundColor: '#f5f5f5',
  },
  editIcon: {
    position: 'absolute',
    right: 0,
    top: 8,
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default EditableInput;
