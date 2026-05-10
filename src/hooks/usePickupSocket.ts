// src/hooks/usePickupSocket.ts

import { useEffect } from 'react';
import { useAppDispatch } from './storehooks';
import { setPickupEvent } from '../features/pickupEventsSlice';
import { useSocket } from '../contexts/socketContext';

export const usePickupSocket = () => {
  const dispatch = useAppDispatch();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const onPickupShut = (data: any) => {
      dispatch(
        setPickupEvent({
          event: 'pickup_shut',
          timestamp: Date.now(),
        }),
      );

      console.log('🚨 Pickup shut event received:', data);
    };

    const onPickupOpen = (data: any) => {
      dispatch(
        setPickupEvent({
          event: 'pickup_open',
          timestamp: Date.now(),
        }),
      );

      console.log('✅ Pickup open event received:', data);
    };

    socket.on('pickup_shut', onPickupShut);
    socket.on('pickup_open', onPickupOpen);

    return () => {
      socket.off('pickup_shut', onPickupShut);
      socket.off('pickup_open', onPickupOpen);
    };
  }, [socket, dispatch]);
};