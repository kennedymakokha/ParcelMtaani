/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/themeContext';
import Toast from '../../components/toast';
import {
  useAddBusinessMutation,
  useDeleteBusinessMutation,
  useGetBusinessesQuery,
  useUpdateBusinessMutation,
} from '../../services/apis/business.api';
import { COUNTRIES } from '../../utils/countryCodes';
import { Fab } from '../../components/buttons/fab';
import { ActionButton } from '../../components/buttons/actionButtons';
import { AddBusinessModal } from './addModal';
import ConfirmDeleteModal from '../../components/modals/confirmDelete';

export default function BusinessManagementScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [page, setPage] = useState(1);
  const [allBusinesses, setAllBusinesses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const onEndReachedCalledDuringMomentum = useRef(false);
  const { data, isLoading, isFetching, refetch } = useGetBusinessesQuery({
    page,
  });
  const businesses = data?.businesses ?? [];
  const [addBusiness, { isLoading: savingbusiness }] = useAddBusinessMutation();
  const [updateBusiness, { isLoading: editing }] = useUpdateBusinessMutation();
  const [deleteBusiness, { isLoading: deleting }] = useDeleteBusinessMutation();
  const [contactName, setcontactName] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const initialState = {
    id: '',
    business_name: '',
    phone_number: '',
    postal_address: '',
    contact_number: '',
    kra_pin: '',
  };
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState({ msg: '', state: '' });
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ✅ Sync data
  useEffect(() => {
    if (page === 1) {
      setAllBusinesses(businesses);
    } else if (businesses.length) {
      setAllBusinesses(prev => {
        const merged = [...prev, ...businesses];
        return Array.from(
          new Map(merged.map(item => [item._id, item])).values(),
        );
      });
    }

    setHasMore(businesses.length > 0);
    setRefreshing(false);
  }, [data]);

  // ✅ Refresh (single call)
  const handleRefresh = () => {
    if (isFetching) return;
    setRefreshing(true);
    setPage(1);
  };

  // ✅ LOAD MORE (FIXED)
  const handleLoadMore = () => {
    if (onEndReachedCalledDuringMomentum.current) return;
    if (isFetching || !hasMore) return;

    onEndReachedCalledDuringMomentum.current = true;
    setPage(prev => prev + 1);
  };

  const handleSave = async () => {
    try {
      if (!form.business_name) {
        setMsg({ msg: 'Business name is required', state: 'error' });
        return;
      }

      if (editingId) {
        await updateBusiness(form).unwrap();
        await refetch();
        setMsg({ msg: 'Business updated successfully', state: 'success' });
      } else {
        await addBusiness(form).unwrap();
        await refetch();
        setMsg({ msg: 'Business added successfully', state: 'success' });
      }

      setForm({
        id: '',
        business_name: '',
        phone_number: '',
        postal_address: '',
        contact_number: '',
        kra_pin: '',
      });

      setEditingId(null);
      setShowFormModal(false);

      setPage(1); // ✅ single refresh trigger
    } catch (err: any) {
      setMsg({
        msg: err.message || err.data?.message || 'Error occurred, try again ',
        state: 'error',
      });
    }
  };

  const handleEdit = (item: any) => {
    setForm({
      id: item._id,
      business_name: item.business_name,
      phone_number: item.phone_number,
      postal_address: item.postal_address,
      contact_number: item.contact_number,
      kra_pin: item.kra_pin,
    });
    setEditingId(item._id);
    setShowFormModal(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteBusiness(selectedId).unwrap();
      setMsg({ msg: 'Business deleted successfully', state: 'success' });
      setShowDeleteModal(false);
      setPage(1); // ✅ single refresh
    } catch (err: any) {
      setMsg({
        msg: err.message || err.data?.message || 'Error occurred, try again ',
        state: 'error',
      });
    }
  };

  if (isLoading && page === 1) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <FlatList
        data={allBusinesses}
        keyExtractor={item => item._id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetching && page > 1 ? (
            <ActivityIndicator style={{ marginVertical: 16 }} />
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              No businesses found
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 14,
              padding: 16,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: '700', color: colors.text }}
            >
              {item.business_name}
            </Text>

            <Text style={{ color: colors.secondary }}>
              📞 {item.phone_number || '—'}
            </Text>
            <Text style={{ color: colors.secondary }}>
              ☎️ {item.contact_number || '—'}
            </Text>
            <Text style={{ color: colors.secondary }}>
              📍 {item.postal_address || '—'}
            </Text>
            <Text style={{ color: colors.secondary }}>
              🧾 {item.kra_pin || '—'}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 12,
              }}
            >
              <ActionButton
                title="View"
                type="secondary"
                onPress={() => navigation.navigate('BusinessDetail', { item })}
              />

              <View style={{ flexDirection: 'row' }}>
                <ActionButton
                  title="Edit"
                  type="primary"
                  onPress={() => handleEdit(item)}
                />
                <ActionButton
                  title="Delete"
                  type="error"
                  onPress={() => {
                    setSelectedId(item._id);
                    setShowDeleteModal(true);
                  }}
                />
              </View>
            </View>
          </View>
        )}
      />

      <Fab onPress={() => setShowFormModal(true)} icon="add" />
      <AddBusinessModal
        showFormModal={showFormModal}
        editingId={editingId}
        form={form}
        contactName={contactName}
        setcontactName={setcontactName}
        setForm={setForm}
        country={country}
        setCountry={setCountry}
        setMsg={setMsg}
        msg={msg}
        handleSave={handleSave}
        savingbusiness={editingId ? editing : savingbusiness}
        setShowFormModal={() => {
          setForm(initialState);
          setEditingId(null);
          setShowFormModal(false);
        }}
      />

      <ConfirmDeleteModal
        visible={showDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
        onCancel={() => setShowDeleteModal(false)}
      />

      {msg.msg && <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />}
    </View>
  );
}
