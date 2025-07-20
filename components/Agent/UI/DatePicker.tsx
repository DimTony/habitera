import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarIcon, CaretDown } from 'components/Svg';

interface LibraryDatePickerProps {
  label: string;
  placeholder: string;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

const LibraryDatePicker: React.FC<LibraryDatePickerProps> = ({
  label,
  placeholder,
  selectedDate,
  onDateSelect,
  minimumDate = new Date(),
  maximumDate = new Date(2030, 11, 31),
}) => {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(selectedDate || new Date());

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, []);

  const onChange = useCallback(
    (event: any, date?: Date) => {
      if (Platform.OS === 'android') {
        setShow(false);
        if (event.type === 'set' && date) {
          onDateSelect(date);
        }
      } else {
        // For iOS, update the temporary date when user scrolls the picker
        if (date && event.type !== 'dismissed') {
          setTempDate(date);
        }
      }
    },
    [onDateSelect]
  );

  const showDatePicker = useCallback(() => {
    // Ensure tempDate is properly set to current selected date or today
    const initialDate = selectedDate || new Date();
    setTempDate(initialDate);
    setShow(true);
  }, [selectedDate]);

  const handleDone = useCallback(() => {
    console.log('Done pressed with date:', tempDate);
    onDateSelect(tempDate);
    setShow(false);
  }, [tempDate, onDateSelect]);

  const handleCancel = useCallback(() => {
    // Reset tempDate to original selected date
    setTempDate(selectedDate || new Date());
    setShow(false);
  }, [selectedDate]);

  if (Platform.OS === 'android') {
    // Android native picker
    return (
      <View style={styles.datePickerContainer}>
        <Text style={styles.dropdownLabel}>{label}</Text>

        <TouchableOpacity style={styles.datePickerButton} onPress={showDatePicker}>
          <Text style={[styles.dropdownText, !selectedDate && styles.placeholderText]}>
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </Text>
          <CalendarIcon />
        </TouchableOpacity>

        {show && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={onChange}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
          />
        )}
      </View>
    );
  }

  // iOS custom modal picker
  return (
    <View style={styles.datePickerContainer}>
      <Text style={styles.dropdownLabel}>{label}</Text>

      <TouchableOpacity style={styles.datePickerButton} onPress={showDatePicker}>
        <Text style={[styles.dropdownText, !selectedDate && styles.placeholderText]}>
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </Text>
        <CalendarIcon />
      </TouchableOpacity>

      <Modal visible={show} transparent animationType="fade" onRequestClose={handleCancel}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleCancel}>
          <View style={styles.datePickerModal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={handleDone}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={onChange}
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                style={styles.picker}
                textColor="#000"
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  datePickerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 24,
    borderColor: '#E2E2E2',
    position: 'relative',
  },
  dropdownLabel: {
    position: 'absolute',
    left: '5%',
    top: -8,
    backgroundColor: '#fff',
    color: '#636363',
    fontSize: 12,
    paddingHorizontal: 5,
    fontFamily: 'Bahnschrift',
    fontWeight: '300',
    zIndex: 1,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 25,
  },
  dropdownText: {
    fontFamily: 'Bahnschrift',
    fontSize: 14,
    color: '#000',
  },
  placeholderText: {
    color: '#9F9F9F',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E2E2',
  },
  modalTitle: {
    fontFamily: 'Bahnschrift',
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  cancelButton: {
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    color: '#636363',
    fontWeight: '500',
  },
  doneButton: {
    fontFamily: 'Bahnschrift',
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  pickerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  picker: {
    height: 200,
    width: '100%',
  },
});

export default LibraryDatePicker;
