/* eslint-disable react-native/no-inline-styles */
import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../contexts/themeContext';

import RouteSkeleton from '../../components/skeletons/pickupSkeleton';
import { ActionButton } from '../../components/buttons/actionButtons';
import { AddModal } from './addRouteModal';
import Toast from '../../components/toast';
import ConfirmDeleteModal from '../../components/modals/confirmDelete';
import {
  Route,
  useCreateRouteMutation,
  useFetchRoutesQuery,
  useTrashRouteMutation,
  useUpdateRouteMutation,
} from '../../services/apis/routes.api';

export default function RouteManagementScreen() {
  const { colors } = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Pagination state
  const [page, setPage] = useState(1);
  const [allRoutes, setAllRoutes] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // API hooks
  const { data, isFetching, refetch } = useFetchRoutesQuery({
    page,
    limit: 10,
    search: '',
  });
  const [createRoute, { isLoading }] = useCreateRouteMutation();
  const [updateRoute, { isLoading: editing }] = useUpdateRouteMutation();
  const [deleteRoute, { isLoading: deleting }] = useTrashRouteMutation();
  const [msg, setMsg] = useState({ msg: '', state: '' });
  // UI state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoute, setEditing] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Form state
  const [RouteName, setRouteName] = useState('');
  const [contactName, setcontactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [state, setState] = useState('inactive');
  const isInitialLoading = isFetching && page === 1 && allRoutes.length === 0;
  /** ✅ Merge data for pagination */
  useEffect(() => {
    if (!data?.routes) return;
    if (page === 1) {
      setAllRoutes(data.routes);
    } else {
      setAllRoutes(prev => {
        const ids = new Set(prev.map(p => p._id));
        const newItems = data.routes.filter((p: any) => !ids.has(p._id));
        return [...prev, ...newItems];
      });
    }
  }, [data, page]);

  /** ✅ Pull to refresh */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  /** ✅ Infinite scroll */
  const loadMore = useCallback(() => {
    if (!isFetching && page < (data?.totalPages || 1)) {
      setPage(prev => prev + 1);
    }
  }, [isFetching, page, data?.totalPages]);

  // Open modal
  const openModal = (route?: any) => {
    if (route) {
      setEditing(route);
      setRouteName(route.route_name);
      setPhoneNumber(route.phone_number || '');
      setShortCode(route.shortCode || '');
      setState(route.state || 'inactive');
      setContactNumber(route.contact_number || 'inactive');
    } else {
      setEditing(null);
      setRouteName('');
      setPhoneNumber('');
      setShortCode('');
      setState('inactive');
    }
    setModalVisible(true);
  };

  // Save Route
  const saveRoute = async () => {
    const payload: Route = {
      route_name: RouteName,
      short_code: shortCode,
      state: state as 'active' | 'inactive',
    };

    if (editingRoute) {
      payload._id = editingRoute._id;
      await updateRoute(payload as any).unwrap();
      await refetch();
      setMsg({ msg: 'Route Updated successfully', state: 'success' });
    } else {
      await createRoute(payload).unwrap();
      setMsg({ msg: 'Route Created successfully', state: 'success' });
      await refetch();
    }
    setModalVisible(false);
    setPage(1);
    refetch();
  };

  // Delete Route

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteRoute(selectedId).unwrap();
      await refetch();
      setMsg({ msg: 'Route deleted successfully', state: 'success' });
      setShowDeleteModal(false);
      setPage(1); // ✅ single refresh
    } catch (err: any) {
      setMsg({
        msg: err.message || err.data?.message || 'Error occurred, try again ',
        state: 'error',
      });
    }
  };
  // Render Route card
  const renderRoute = ({ item }: { item: any }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {item.Route_name}
      </Text>
      <Text style={{ color: colors.secondary }}>
        Route: {item.route_name || 'N/A'}
      </Text>
      <Text style={{ color: colors.primary }}>
        Short Code : {item.shortCode || 'N/A'}
      </Text>
      <Text style={{ color: colors.primary }}>
        Contact: {item.contactName || 'N/A'}
      </Text>
      <Text
        style={{
          color: item.state === 'active' ? colors.success : colors.error,
        }}
      >
        Status: {item.state}
      </Text>

      <View
        className="gap-1"
        style={{ flexDirection: 'row', rowGap: 5, marginTop: 10 }}
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
            setSelectedId(item._id);
            setShowDeleteModal(true);
          }}
        />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <View
        style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}
      >
        {isInitialLoading ? (
          <RouteSkeleton />
        ) : (
          <FlatList
            data={allRoutes}
            keyExtractor={item => item._id}
            renderItem={renderRoute}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetching && page > 1 ? (
                <Text style={{ textAlign: 'center', padding: 10 }}>
                  Loading more...
                </Text>
              ) : null
            }
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', color: colors.secondary }}>
                No Routes found
              </Text>
            }
          />
        )}
      </View>

      {/* Floating Add Button */}
      {msg.msg && <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />}
      <TouchableOpacity
        onPress={() => openModal()}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          backgroundColor: colors.primary,
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderRadius: 50,
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 20 }}>
          ＋
        </Text>
      </TouchableOpacity>
      <ConfirmDeleteModal
        visible={showDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
        onCancel={() => setShowDeleteModal(false)}
      />
      {/* Add/Edit Modal */}
      <AddModal
        modalVisible={modalVisible}
        editingRoute={editingRoute}
        RouteName={RouteName}
        setRouteName={setRouteName}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        shortCode={shortCode}
        setShortCode={setShortCode}
        contactNumber={contactNumber}
        setContactNumber={setContactNumber}
        saveRoute={saveRoute}
        contactName={contactName}
        setcontactName={setcontactName}
        isLoading={editingRoute ? editing : isLoading}
        setModalVisible={() => {
          setContactNumber('');
          setPhoneNumber('');
          setRouteName('');
          setShortCode('');
          setModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderColor: '#ffffff',
  },
});
