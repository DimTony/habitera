import React from 'react';
import { View, Text, StyleSheet, TextInput, TextInputProps } from 'react-native';

interface EditableFieldProps extends Omit<TextInputProps, 'onChangeText' | 'onBlur' | 'value'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  /** When false, field is read-only (no per-field edit icon). */
  editable?: boolean;
  /** Permanently non-editable (e.g. email). Still shows value clearly. */
  readOnly?: boolean;
}

const EditableInput: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  editable = false,
  readOnly = false,
  placeholder,
  ...textInputProps
}) => {
  const canEdit = editable && !readOnly;
  const hasError = Boolean(touched && error);

  return (
    <View
      style={[
        styles.fieldSet,
        hasError ? styles.fieldSetError : null,
        readOnly ? styles.fieldSetReadOnly : null,
      ]}>
      <Text style={[styles.legend, hasError ? styles.legendError : null]}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.textInput,
            !canEdit ? styles.textInputLocked : null,
            readOnly ? styles.textInputReadOnly : null,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          editable={canEdit}
          selectTextOnFocus={canEdit}
          {...textInputProps}
        />
      </View>
      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
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
  fieldSetReadOnly: {
    backgroundColor: '#F7F7F7',
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
    color: '#222',
    paddingVertical: 12,
  },
  textInputLocked: {
    color: '#333',
  },
  textInputReadOnly: {
    color: '#222',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default EditableInput;
