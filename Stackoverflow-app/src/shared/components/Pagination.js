import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.pageSquare, currentPage === 1 && styles.disabledOpacity]}
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Feather name="chevron-left" size={18} color="#3B4045" />
      </TouchableOpacity>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
        <TouchableOpacity
          key={num}
          style={[
            styles.pageSquare,
            currentPage === num && styles.activePageSquare,
          ]}
          onPress={() => onPageChange(num)}
        >
          <Text
            style={[
              styles.pageNumberText,
              currentPage === num && styles.activePageNumberText,
            ]}
          >
            {num}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.pageSquare, currentPage === totalPages && styles.disabledOpacity]}
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Feather name="chevron-right" size={18} color="#3B4045" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 20,
    gap: 6,
  },
  pageSquare: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E6E8',
  },
  activePageSquare: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  pageNumberText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3B4045',
  },
  activePageNumberText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  disabledOpacity: {
    opacity: 0.3,
  },
});
