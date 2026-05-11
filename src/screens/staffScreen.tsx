/* eslint-disable react-native/no-inline-styles */
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Modal, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/themeContext';
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useSignupMutation,
} from '../services/apis/auth.api';
import { Picker } from '@react-native-picker/picker';
import { rolesData } from '../utils/roles';
import FilterChips from '../components/horizontalScroller';
import { useSelector } from 'react-redux';
import { PhoneInput } from '../components/phoneinput';
import { FormInput } from '../components/input.component';
import { COUNTRIES } from '../utils/countryCodes';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { Fab } from '../components/buttons/fab';
import { SearchBar } from '../components/ui/SearchBar';
import { ActionButton } from '../components/buttons/actionButtons';
import ConfirmModal from '../components/modals/confirmDelete';
import { SectionHeader } from '../components/ui/sectionHeader';
import Toast from '../components/toast';

interface Staff {
  _id: string;
  name?: string;
  role: string;
  phone_number: string;
  identification_No: string;
}

export default function StaffManagementScreen() {
  const { colors } = useTheme();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const [DeleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('attendant');
  const [identification_No, setIdentification_No] = useState('');
  const [phone, setPhone] = useState('');
  const [signUp, { isLoading: isCreating }] = useSignupMutation();
  const { user } = useSelector((state: any) => state.auth);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [msg, setMsg] = useState({ msg: '', state: '' });
  const currentPickup = useSelector(
    (state: any) => state.pickups.currentPickup,
  );

  const { data, isLoading, isFetching, refetch } = useGetUsersQuery({
    page,
    search: debouncedSearch,
    pickup: currentPickup._id,
    role,
  });

  // ✅ debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  // ✅ reset list when filters/search changes
  useEffect(() => {
    setPage(1);
    setAllStaff([]);
  }, [role, debouncedSearch]);

  // ✅ merge paginated data
  useEffect(() => {
    if (data?.users) {
      setAllStaff(prev => {
        const merged = page === 1 ? data.users : [...prev, ...data.users];

        // remove duplicates
        const unique = merged.filter(
          (item: any, index: number, self: any[]) =>
            index === self.findIndex((s: any) => s._id === item._id),
        );

        return unique;
      });

      setHasMore(data.page < data.totalPages);
    }
  }, [data, page]);

  const handleDelete = async () => {
    if (!selectedStaffId) return;

    try {
      await DeleteUser(selectedStaffId).unwrap();

      setShowDeleteModal(false);
      setSelectedStaffId(null);

      setPage(1);
      refetch();
    } catch (error) {
      console.log(error);
    }
  };

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    refetch();
  };

  const openModal = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff);

      setName(staff.name || '');
      setRole(staff.role);
      setPhone(staff.phone_number);
      setIdentification_No(staff.identification_No);
    } else {
      setEditingStaff(null);

      setName('');
      setRole('');
      setPhone('');
      setIdentification_No('');
    }

    setShowModal(true);
  };

  const saveStaff = async () => {
    try {
      if (!editingStaff) {
        await signUp({
          name,
          role: 'attendant',
          phone_number: phone,
          identification_No,
        }).unwrap();
      }
      setPage(1);
      await refetch();
      setShowModal(false);
      setName('');
      setRole('attendant');
      setPhone('');
      setIdentification_No('');
    } catch (err: any) {
      setMsg({
        msg: err.message || err.data?.message || 'Error occurred, try again ',
        state: 'error',
      });
    }
  };

  const renderStaff = ({ item }: { item: Staff }) => (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
        }}
      >
        {item.name || 'No Name'}
      </Text>

      <Text
        style={{
          color: colors.secondary,
          marginTop: 4,
        }}
      >
        Role: {item.role}
      </Text>

      <Text
        style={{
          color: colors.primary,
          marginTop: 4,
        }}
      >
        Phone: {item.phone_number}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          marginTop: 12,
          gap: 10,
        }}
      >
        <ActionButton
          title="Edit"
          type="primary"
          onPress={() => openModal(item)}
        />

        <ActionButton
          title="Delete"
          type="error"
          onPress={() => {
            setSelectedStaffId(item._id);
            setShowDeleteModal(true);
          }}
        />
      </View>
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 24,
      }}
    >
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: 2,
          paddingBottom: 120,
        }}
        data={allStaff.filter(s =>
          selectedCategoryId ? s.role === selectedCategoryId : true,
        )}
        keyExtractor={item => item._id}
        renderItem={renderStaff}
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            {user.role === 'superAdmin' && (
              <FilterChips
                data={rolesData}
                selected={selectedCategoryId}
                onSelect={value => {
                  setSelectedCategoryId(value);
                  setRole(value || '');
                }}
                labelExtractor={item => item}
                showAllOption
                allLabel="All Roles"
              />
            )}

            <SearchBar
              value={search}
              onChangeText={setSearch}
              onClear={() => setSearch('')}
              placeholder="Search staff..."
            />
          </View>
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={isLoading && page === 1}
        ListFooterComponent={
          isFetching ? <ActivityIndicator style={{ margin: 10 }} /> : null
        }
        ListEmptyComponent={
          <Text
            style={{
              textAlign: 'center',
              color: colors.secondary,
              marginTop: 40,
            }}
          >
            No staff found
          </Text>
        }
      />

      <Fab onPress={() => openModal()} />

      <Modal visible={showModal} animationType="slide">
        <View
          style={{
            flex: 1,
            padding: 24,
            backgroundColor: colors.background,
          }}
        >
          <SectionHeader title={editingStaff ? 'Edit Staff' : 'Add Staff'} />

          <FormInput
            label="Name"
            placeholder="Name"
            value={name
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
            onChangeText={setName}
          />

          {user.role === 'superAdmin' && (
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Picker selectedValue={role} onValueChange={setRole}>
                <Picker.Item label="Select role" value="" />

                {rolesData.map(r => (
                  <Picker.Item key={r} label={r} value={r} />
                ))}
              </Picker>
            </View>
          )}

          <FormInput
            label="Identification Number"
            placeholder="ID No"
            value={identification_No}
            onChangeText={setIdentification_No}
          />

          <PhoneInput
            label="Phone Number"
            value={phone}
            country={country}
            onChangeCountry={setCountry}
            onChange={full => setPhone(full)}
          />
          {msg.msg && <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />}
          <PrimaryButton
            title={isCreating ? 'Saving...' : 'Save'}
            onPress={saveStaff}
          />

          <SecondaryButton title="Cancel" onPress={() => setShowModal(false)} />
        </View>
      </Modal>

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Staff"
        message="This will remove the staff permanently."
        onConfirm={handleDelete}
        loading={isDeleting}
        onCancel={() => setShowDeleteModal(false)}
      />
    </View>
  );
}
