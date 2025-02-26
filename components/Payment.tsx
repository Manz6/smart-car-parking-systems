import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://velagnrotxuqhiczsczz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw';
const supabase = createClient(supabaseUrl, supabaseKey);

const Payment = ({ route, navigation }) => {
  const { slots, amount, pricePerSlot, session } = route.params;
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (session && session.user && session.user.id) {
      setUserId(session.user.id);
    } else {
      console.log('Invalid or missing session data');
      Alert.alert('Error', 'Authentication session is missing. Please log in again.');
      navigation.goBack();
    }
  }, [session, navigation]);

  const handlePayment = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      const paymentData = {
        user_id: userId,
        date: new Date().toISOString(),
        amount: amount,
        status: 'Success',
        lot: slots,
      };

      const { error } = await supabase
        .from('payment_history')
        .insert([paymentData]);

      if (error) throw error;

      Alert.alert(
        "Payment Successful",
        `You have successfully reserved ${slots.length} parking slot(s) for ₹${amount}.`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate('Account')
          }
        ]
      );
    } catch (err) {
      console.error('Payment error:', err);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Payment Summary</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Selected Slots:</Text>
          <Text style={styles.value}>{slots.join(', ')}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Price per Slot:</Text>
          <Text style={styles.value}>₹{pricePerSlot}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Number of Slots:</Text>
          <Text style={styles.value}>{slots.length}</Text>
        </View>

        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>₹{amount}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payButtonText}>Pay Now</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default Payment;
