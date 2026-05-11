import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../store';

import { useLazyFetchUserQuery } from '../services/apis/auth.api';
import { setCredentials } from '../features/auth/authSlice';

export default function PickupUserSync() {
  const dispatch = useDispatch();

  const lastEvent = useSelector(
    (state: RootState) => state.pickupEvents.lastEvent,
  );

  const token = useSelector(
    (state: RootState) => state.auth.token,
  );

  const [fetchUser] = useLazyFetchUserQuery();

  useEffect(() => {
    if (!lastEvent) return;

    const syncUser = async () => {
      try {
        console.log('🔄 Pickup event changed:', lastEvent);

        const res = await fetchUser({}).unwrap();

        dispatch(
          setCredentials({
            token,
            user: res.user || res,
          }),
        );

        console.log('✅ User updated after pickup event');
      } catch (err) {
        console.log('❌ Failed to sync user:', err);
      }
    };

    syncUser();
  }, [lastEvent]);

  return null;
}