import React, { useState, useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ConnectModal from './ConnectModal';

const ConnectUserButton = ({ targetUserId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const response = await axios.get(`localhost:3001/api/user/check-connection/${targetUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsConnected(response.data.connectionExists);
        setConnectionStatus(response.data.connectionStatus);
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };
    checkConnection();
  }, [targetUserId]);

  const handleSubmit = async (connectionData) => {
    setIsPending(true);
    const requesterUserRole = await AsyncStorage.getItem('user_role');
    const { reason, comment } = connectionData;
    const requestData = { targetUserId, reason, comment, requesterUserRole };
    try {
      const token = await AsyncStorage.getItem('auth_token');
      await axios.put('localhost:3001/api/user-connect', requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Connection request sent successfully');
    } catch (error) {
      console.error('Error in process:', error);
    }
    setModalOpen(false);
  };

  const handleDeleteConnection = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      await axios.delete(`localhost:3001/api/delete-connection/${targetUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Connection deleted successfully');
      setIsConnected(false);
    } catch (error) {
      console.error('Error deleting connection:', error);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  return (
    <View>
      {isConnected ? (
        connectionStatus === 'approved' ? (
          <Button
            title="Disconnect"
            color="white"
            onPress={handleDeleteConnection}
            style={{ backgroundColor: 'black' }}
          />
        ) : (
          <Button title="Pending..." color="white" disabled style={{ backgroundColor: 'black' }} />
        )
      ) : (
        <Button
          title={isPending ? 'Pending' : 'Connect'}
          color="white"
          onPress={() => {
            setModalOpen(true);
            setIsPending(true);
          }}
          disabled={isPending}
          style={{ backgroundColor: isPending ? 'black' : '#01BF02' }}
        />
      )}
      {modalOpen && <ConnectModal onSubmit={handleSubmit} onClose={handleClose} />}
    </View>
  );
};

export default ConnectUserButton;