/* eslint-disable react-native/no-inline-styles */
import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/themeContext';
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useSignupMutation,
  useUpdateuserMutation,
} from '../../services/apis/auth.api';
import { rolesData } from '../../utils/roles';
import FilterChips from '../../components/horizontalScroller';
import { useSelector } from 'react-redux';
import { COUNTRIES } from '../../utils/countryCodes';
import { Fab } from '../../components/buttons/fab';
import { SearchBar } from '../../components/ui/SearchBar';
import { ActionButton } from '../../components/buttons/actionButtons';
import ConfirmModal from '../../components/modals/confirmDelete';
import { AddSalesPsersonModal } from './addSalesPersonModal';

interface Staff {
  _id: string;
  name?: string;
  role: string;
  phone_number: string;
}

export default function SuperSalesManagementScreen() {
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
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [name, setName] = useState('');
  const [identification_No, setIdentification_No] = useState('');
  const [phone, setPhone] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const { user } = useSelector((state: any) => state.auth);
  const [DeleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [signUp, { isLoading: isCreating }] = useSignupMutation();
  const [updateSales, { isLoading: editing }] = useUpdateuserMutation();
  const { data, isLoading, isFetching, refetch } = useGetUsersQuery(
    {
      page,
      search: debouncedSearch,
      role: 'supersales',
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  // ✅ debounce search
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
      setAllStaff(prev => {
        const merged = page === 1 ? data.users : [...prev, ...data.users];

        const unique = merged.filter(
          (item: any, index: any, self: any) =>
            index === self.findIndex((s: any) => s._id === item._id),
        );

        return unique;
      });

      setHasMore(data.page < data.totalPages);
    }
  }, [data, page]);

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleRefresh = () => {
    setPage(1); // triggers refetch automatically
  };

  const handleDelete = async () => {
    if (!selectedStaffId) return;

    try {
      await DeleteUser(selectedStaffId).unwrap();
      await refetch();
      setShowDeleteModal(false);
      setSelectedStaffId(null);
      setPage(1); // trigger fresh fetch
    } catch (error) {
      console.log(error);
    }
  };

  const openModal = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff);
      setName(staff.name || '');
      setPhone(staff.phone_number);
    } else {
      setEditingStaff(null);
      setName('');
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
          role: 'supersales',
          phone_number: phone,
          identification_No,
        }).unwrap();

        setPage(1); // trigger refetch
      }
      await updateSales({
        _id: editingStaff?._id,
        name,
        phone_number: phone,
        identification_No,
      }).unwrap;
      await refetch();
      setShowModal(false);
    } catch (error) {
      console.log(error);
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
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
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
                onSelect={setSelectedCategoryId}
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

      <AddSalesPsersonModal
        showModal={showModal}
        editingStaff={editingStaff}
        name={name}
        setName={setName}
        country={country}
        setCountry={setCountry}
        identification_No={identification_No}
        setIdentification_No={setIdentification_No}
        phone={phone}
        setPhone={setPhone}
        isCreating={editingStaff ? editing : isCreating}
        saveStaff={saveStaff}
        setShowModal={() => {
          setName('');
          setIdentification_No('');
          setShowModal(false);
        }}
      />
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
