/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useTheme } from '../../contexts/themeContext';
import { FormInput } from '../../components/input.component';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import Toast from '../../components/toast';
import {
  useAddBusinessMutation,
  useDeleteBusinessMutation,
  useGetBusinessesQuery,
  useUpdateBusinessMutation,
} from '../../services/apis/business.api';
import { PhoneInput } from '../../components/phoneinput';
import { COUNTRIES } from '../../utils/countryCodes';
import { Fab } from '../../components/buttons/fab';
import { ActionButton } from '../../components/buttons/actionButtons';
import { SectionHeader } from '../../components/ui/sectionHeader';
import { Platform } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';

export default function BusinessManagementScreen({ navigation }: any) {
  const { colors } = useTheme();

  const [page, setPage] = useState(1);
  const [allBusinesses, setAllBusinesses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const onEndReachedCalledDuringMomentum = useRef(false);

  const { data, isLoading, isFetching } = useGetBusinessesQuery({ page });

  const businesses = data?.businesses ?? [];

  const [addBusiness, { isLoading: savingbusiness }] = useAddBusinessMutation();
  const [updateBusiness] = useUpdateBusinessMutation();
  const [deleteBusiness] = useDeleteBusinessMutation();

  const [country, setCountry] = useState(COUNTRIES[0]);

  const [form, setForm] = useState({
    id: '',
    business_name: '',
    phone_number: '',
    postal_address: '',
    contact_number: '',
    kra_pin: '',
  });

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
        setMsg({ msg: 'Business updated successfully', state: 'success' });
      } else {
        await addBusiness(form).unwrap();
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
      setMsg({ msg: err.message || 'Error occurred', state: 'error' });
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
      setMsg({ msg: err.message || 'Error occurred', state: 'error' });
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

      <Modal visible={showFormModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={{
                flex: 1,
                backgroundColor: colors.overlay,
                justifyContent: 'center',
                padding: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <SectionHeader
                  title={editingId ? 'Edit Business' : 'Add Business'}
                />

                <FormInput
                  label="Business Name"
                  value={form.business_name}
                  onChangeText={text =>
                    setForm({ ...form, business_name: text })
                  }
                />
                <PhoneInput
                  label="Phone Number"
                  value={form.phone_number}
                  onChange={(text: any) =>
                    setForm({ ...form, phone_number: text })
                  }
                  country={country}
                  onChangeCountry={setCountry}
                />
                <FormInput
                  label="Postal Address"
                  value={form.postal_address}
                  onChangeText={text =>
                    setForm({ ...form, postal_address: text })
                  }
                />
                <PhoneInput
                  label="Contact Number"
                  value={form.contact_number}
                  onChange={(text: any) =>
                    setForm({ ...form, contact_number: text })
                  }
                  country={country}
                  onChangeCountry={setCountry}
                />
                <FormInput
                  label="KRA PIN"
                  value={form.kra_pin}
                  onChangeText={text => setForm({ ...form, kra_pin: text })}
                />

                {msg.msg && (
                  <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />
                )}

                <PrimaryButton
                  title={editingId ? 'Update Business' : 'Add Business'}
                  onPress={handleSave}
                  loading={savingbusiness}
                />
                <SecondaryButton
                  title="Cancel"
                  onPress={() => setShowFormModal(false)}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showDeleteModal} animationType="fade" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 20,
              width: '80%',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Confirm Delete
            </Text>
            <Text style={{ color: colors.secondary, marginBottom: 20 }}>
              Are you sure you want to delete this business?
            </Text>
            <PrimaryButton title="Yes, Delete" onPress={handleDelete} />
            <SecondaryButton
              title="Cancel"
              onPress={() => setShowDeleteModal(false)}
            />
          </View>
        </View>
      </Modal>

      {msg.msg && <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />}
    </View>
  );
}
