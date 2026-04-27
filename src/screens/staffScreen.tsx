/* eslint-disable react-native/no-inline-styles */
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/themeContext';
import { useGetUsersQuery, useSignupMutation } from '../services/apis/auth.api';
import { Picker } from '@react-native-picker/picker';
import { rolesData } from '../utils/roles';
import FilterChips from '../components/horizontalScroller';

interface Staff {
  _id: string;
  name?: string;
  role: string;
  phone_number: string;
}

export default function StaffManagementScreen() {
  const { colors } = useTheme();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [page, setPage] = useState(1);
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [identification_No, setIdentification_No] = useState('');
  const [phone, setPhone] = useState('');

  const [signUp, { isLoading: isCreating }] = useSignupMutation();

  const { data, isLoading, isFetching, refetch } = useGetUsersQuery({
    page,
    search: debouncedSearch,
  });
  console.log('Staff data:', data);
  // ✅ debounce search (prevents too many API calls)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  // ✅ merge paginated data
  useEffect(() => {
    if (data?.users) {
      if (page === 1) {
        setAllStaff(data.users);
      } else {
        setAllStaff(prev => [...prev, ...data.users]);
      }

      setHasMore(data.page < data.totalPages);
    }
  }, [data, page]);

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
    if (!editingStaff) {
      await signUp({
        name,
        role,
        phone_number: phone,
        identification_No,
      }).unwrap();

      setPage(1);
      refetch();
    }

    setShowModal(false);
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
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
        {item.name || 'No Name'}
      </Text>

      <Text style={{ color: colors.secondary, marginTop: 4 }}>
        Role: {item.role}
      </Text>

      <Text style={{ color: colors.primary, marginTop: 4 }}>
        Phone: {item.phone_number}
      </Text>

      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <TouchableOpacity
          onPress={async () => {
            openModal(item);
            await refetch();
          }}
          style={{
            backgroundColor: colors.primary,
            padding: 10,
            borderRadius: 8,
            marginRight: 8,
          }}
        >
          <Text style={{ color: '#fff' }}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: colors.error,
            padding: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#fff' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
      {/* 🔍 Search */}
      ListHeaderComponent=
      {
        <View style={{ marginBottom: 16 }}>
          <FilterChips
            data={rolesData}
            selected={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            labelExtractor={item => item}
            showAllOption
            allLabel="All Roles"
          />

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              borderRadius: 8,
              paddingHorizontal: 14,
              paddingVertical: 10,
              fontSize: 16,
              color: colors.text,
              marginTop: 12,
            }}
            placeholder="Search staff..."
            placeholderTextColor={colors.secondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      }
      
      {/* 📋 List */}
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
      {/* ➕ FAB */}
      <TouchableOpacity
        onPress={() => openModal()}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          backgroundColor: colors.primary,
          padding: 16,
          borderRadius: 50,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 20 }}>＋</Text>
      </TouchableOpacity>
      {/* 🧾 Modal */}
      <Modal visible={showModal} animationType="slide">
        <View
          style={{ flex: 1, padding: 24, backgroundColor: colors.background }}
        >
          <Text style={{ fontSize: 20, marginBottom: 16 }}>
            {editingStaff ? 'Edit Staff' : 'Add Staff'}
          </Text>

          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              padding: 10,
              marginBottom: 12,
              borderRadius: 8,
              color: colors.text,
            }}
          />

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

          <TextInput
            placeholder="ID No"
            value={identification_No}
            onChangeText={setIdentification_No}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              padding: 10,
              marginBottom: 12,
              borderRadius: 8,
              color: colors.text,
            }}
          />

          <TextInput
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              padding: 10,
              marginBottom: 12,
              borderRadius: 8,
              color: colors.text,
            }}
          />

          <TouchableOpacity
            onPress={saveStaff}
            style={{
              backgroundColor: colors.primary,
              padding: 14,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>
              {isCreating ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowModal(false)}
            style={{
              backgroundColor: colors.error,
              padding: 14,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
