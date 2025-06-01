import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity, Modal, TextInput, Alert, Animated } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { Swipeable } from 'react-native-gesture-handler';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-gesture-handler';
export default function Page() {
    const [data, setData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalDetailVisible, setModalDetailVisible] = useState(false);
    const [nama, setNama] = useState('');
    const [alamat, setAlamat] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = 5;
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');
    const fadeAnim = useRef(new Animated.Value(0)).current;
  
    const API_URL = 'http://192.168.168.9/crudreact-native/apitoken.php';
    const API_KEY = 'm4rd1best';
  
    useEffect(() => {
      fetchData();
    }, []);
  
    useEffect(() => {
      if (searchQuery.trim() === '') {
        setFilteredData(data);
      } else {
        const filtered = data.filter(item => 
          item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.alamat.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredData(filtered);
      }
      setCurrentPage(1); // Reset ke halaman pertama saat pencarian
    }, [searchQuery, data]);
  
    const fetchData = () => {
      setLoading(true);
      console.log('Fetching data with token:', API_KEY);
  
      // Tambahkan token sebagai query parameter
      const url = `${API_URL}?op=normal&token=${encodeURIComponent(API_KEY)}`;
      console.log('Request URL:', url);
  
      fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
        .then(async response => {
          const data = await response.json();
          console.log('Response data:', data);
          
          if (!response.ok) {
            throw new Error(data.error || 'Terjadi kesalahan');
          }
          return data;
        })
        .then(json => {
          setData(json.data?.result || []);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          showAlert(error.message || 'Gagal mengambil data', 'error');
          setLoading(false);
        });
    };
  
    // Fungsi untuk mendapatkan data yang akan ditampilkan
    const getCurrentPageData = () => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredData.slice(startIndex, endIndex);
    };
  
    // Fungsi untuk menghitung total halaman
    const getTotalPages = () => {
      return Math.ceil(filteredData.length / itemsPerPage);
    };
  
    // Fungsi untuk halaman berikutnya
    const nextPage = () => {
      if (currentPage < getTotalPages()) {
        setCurrentPage(currentPage + 1);
      }
    };
  
    // Fungsi untuk halaman sebelumnya
    const prevPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };
  
    const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
      setAlertMessage(message);
      setAlertType(type);
      setAlertVisible(true);
      
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setAlertVisible(false);
      });
    };
  
    const simpanData = () => {
      if (!nama || !alamat) {
        showAlert('Isi semua data terlebih dahulu', 'error');
        return;
      }
  
      const formData = new FormData();
      formData.append('nama', nama);
      formData.append('alamat', alamat);
      formData.append('token', API_KEY);
  
      let url = `${API_URL}?op=create&token=${encodeURIComponent(API_KEY)}`;
      let method = 'POST';
  
      if (editId) {
        url = `${API_URL}?op=update&id=${editId}&token=${encodeURIComponent(API_KEY)}`;
      }
  
      setLoading(true);
      console.log('Saving data with token:', API_KEY);
      console.log('Request URL:', url);
  
      fetch(url, {
        method: method,
        headers: {
          'Accept': 'application/json'
        },
        body: formData,
      })
        .then(async response => {
          const data = await response.json();
          console.log('Response data:', data);
          
          if (!response.ok) {
            throw new Error(data.error || 'Terjadi kesalahan');
          }
          return data;
        })
        .then(json => {
          showAlert(editId ? 'Data berhasil diupdate' : 'Data berhasil disimpan');
          setModalVisible(false);
          setNama('');
          setAlamat('');
          setEditId(null);
          fetchData();
        })
        .catch(error => {
          console.error('Error simpan data:', error);
          showAlert(error.message || 'Gagal menyimpan data', 'error');
          setLoading(false);
        });
    };
  
    const hapusData = (id: string) => {
      Alert.alert('Konfirmasi', 'Yakin ingin menghapus data ini?', [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            setLoading(true);
            console.log('Deleting data with token:', API_KEY);
  
            // Tambahkan token sebagai query parameter
            const url = `${API_URL}?op=delete&id=${id}&token=${encodeURIComponent(API_KEY)}`;
            console.log('Request URL:', url);
  
            fetch(url, {
              method: 'DELETE',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            })
              .then(async response => {
                const data = await response.json();
                console.log('Response data:', data);
                
                if (!response.ok) {
                  throw new Error(data.error || 'Terjadi kesalahan');
                }
                return data;
              })
              .then(json => {
                showAlert('Data berhasil dihapus');
                fetchData();
              })
              .catch(error => {
                console.error('Error hapus data:', error);
                showAlert(error.message || 'Gagal menghapus data', 'error');
                setLoading(false);
              });
          },
        },
      ]);
    };
  
    const editData = (item: any) => {
      setNama(item.nama);
      setAlamat(item.alamat);
      setEditId(item.id);
      setModalVisible(true);
    };
  
    const lihatDetail = (item: any) => {
      setSelectedItem(item);
      setModalDetailVisible(true);
    };
  
    const renderRightActions = (item: any) => {
      return (
        <View style={styles.swipeActions}>
          <TouchableOpacity 
            style={[styles.swipeButton, styles.swipeButtonDetail]} 
            onPress={() => lihatDetail(item)}
          >
            <View style={styles.swipeButtonContent}>
              <Ionicons name="information-circle" size={24} color="#fff" />
              <Text style={styles.swipeButtonText}>Detail</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.swipeButton, styles.swipeButtonEdit]} 
            onPress={() => editData(item)}
          >
            <View style={styles.swipeButtonContent}>
              <Ionicons name="pencil" size={24} color="#fff" />
              <Text style={styles.swipeButtonText}>Edit</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.swipeButton, styles.swipeButtonDelete]} 
            onPress={() => hapusData(item.id)}
          >
            <View style={styles.swipeButtonContent}>
              <Ionicons name="trash" size={24} color="#fff" />
              <Text style={styles.swipeButtonText}>Hapus</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    };
  
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading data...</Text>
        </View>
      );
    }
  
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Daftar Pegawai</Text>
          <TouchableOpacity style={styles.buttonReload} onPress={fetchData}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
  
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6c757d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama atau alamat..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6c757d"
          />
          {searchQuery !== '' && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#6c757d" />
            </TouchableOpacity>
          )}
        </View>
  
        <FlatList
          data={getCurrentPageData()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() => renderRightActions(item)}
              rightThreshold={40}
            >
              <View style={styles.card}>
                <Text style={styles.nama}>Nama: {item.nama}</Text>
                <Text style={styles.alamat}>Alamat: {item.alamat}</Text>
                <Text style={styles.tgl}>Tanggal Input: {item.tgl_input}</Text>
              </View>
            </Swipeable>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={50} color="#6c757d" />
              <Text style={styles.emptyText}>Tidak ada data yang ditemukan</Text>
            </View>
          )}
        />
  
        <View style={styles.paginationContainer}>
          <TouchableOpacity 
            style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]} 
            onPress={prevPage}
            disabled={currentPage === 1}
          >
            <Text style={styles.paginationButtonText}>← Prev</Text>
          </TouchableOpacity>
          
          <Text style={styles.paginationText}>
            Halaman {currentPage} dari {getTotalPages()}
          </Text>
          
          <TouchableOpacity 
            style={[styles.paginationButton, currentPage === getTotalPages() && styles.paginationButtonDisabled]} 
            onPress={nextPage}
            disabled={currentPage === getTotalPages()}
          >
            <Text style={styles.paginationButtonText}>Next →</Text>
          </TouchableOpacity>
        </View>
  
        <TouchableOpacity style={styles.buttonTambah} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Tambah Pegawai</Text>
        </TouchableOpacity>
  
        <Modal visible={modalDetailVisible} transparent animationType="slide">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Detail Pegawai</Text>
              
              {selectedItem && (
                <View style={styles.detailContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ID:</Text>
                    <Text style={styles.detailValue}>{selectedItem.id}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Nama:</Text>
                    <Text style={styles.detailValue}>{selectedItem.nama}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Alamat:</Text>
                    <Text style={styles.detailValue}>{selectedItem.alamat}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tanggal Input:</Text>
                    <Text style={styles.detailValue}>{selectedItem.tgl_input}</Text>
                  </View>
                </View>
              )}
  
              <TouchableOpacity 
                style={styles.buttonBatal} 
                onPress={() => setModalDetailVisible(false)}
              >
                <Text style={styles.buttonText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
  
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{editId ? 'Edit Pegawai' : 'Tambah Pegawai'}</Text>
  
              <TextInput
                placeholder="Nama"
                value={nama}
                onChangeText={setNama}
                style={styles.input}
              />
              <TextInput
                placeholder="Alamat"
                value={alamat}
                onChangeText={setAlamat}
                style={styles.input}
              />
  
              <TouchableOpacity style={styles.buttonSimpan} onPress={simpanData}>
                <Text style={styles.buttonText}>{editId ? 'Update' : 'Simpan'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonBatal} onPress={() => {
                setModalVisible(false);
                setEditId(null);
                setNama('');
                setAlamat('');
              }}>
                <Text style={styles.buttonText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
  
        {alertVisible && (
          <Animated.View 
            style={[
              styles.alertContainer,
              { 
                opacity: fadeAnim,
                backgroundColor: alertType === 'success' ? '#28a745' : '#dc3545'
              }
            ]}
          >
            <Ionicons 
              name={alertType === 'success' ? 'checkmark-circle' : 'alert-circle'} 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.alertText}>{alertMessage}</Text>
          </Animated.View>
        )}
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
      container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
      headerContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 20 
      },
      title: { fontSize: 28, fontWeight: 'bold', color: '#007bff', flex: 1 },
      buttonReload: {
        backgroundColor: '#17a2b8',
        padding: 10,
        borderRadius: 8,
        marginLeft: 10,
      },
      card: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      },
      nama: { fontSize: 18, fontWeight: '600', color: '#343a40', marginBottom: 5 },
      alamat: { fontSize: 14, color: '#6c757d', marginBottom: 5 },
      tgl: { fontSize: 12, color: '#adb5bd' },
      center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
      buttonRow: { flexDirection: 'row', marginTop: 12, justifyContent: 'space-between' },
      buttonDetail: {
        backgroundColor: '#17a2b8',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginRight: 5,
      },
      buttonEdit: { backgroundColor: '#ffc107', padding: 10, borderRadius: 8, flex: 1, marginRight: 5 },
      buttonDelete: { backgroundColor: '#dc3545', padding: 10, borderRadius: 8, flex: 1, marginLeft: 5 },
      buttonTambah: {
        backgroundColor: '#007bff',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: 'row',
        justifyContent: 'center',
      },
      buttonSimpan: {
        backgroundColor: '#28a745',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
      },
      buttonBatal: {
        backgroundColor: '#6c757d',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
      },
      buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
      modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        width: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
      },
      modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#007bff' },
      input: {
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
        backgroundColor: '#fff',
      },
      detailContainer: {
        marginBottom: 20,
      },
      detailRow: {
        flexDirection: 'row',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
        paddingBottom: 10,
      },
      detailLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#495057',
      },
      detailValue: {
        flex: 2,
        fontSize: 16,
        color: '#212529',
      },
      paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      paginationButton: {
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 6,
      },
      paginationButtonDisabled: {
        backgroundColor: '#ccc',
      },
      paginationButtonText: {
        color: '#fff',
        fontWeight: 'bold',
      },
      paginationText: {
        fontSize: 14,
        color: '#495057',
      },
      swipeActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
        paddingRight: 5,
      },
      swipeButton: {
        width: 80,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        marginLeft: 5,
      },
      swipeButtonContent: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      swipeButtonText: {
        color: '#fff',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '600',
      },
      swipeButtonDetail: {
        backgroundColor: '#17a2b8',
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      },
      swipeButtonEdit: {
        backgroundColor: '#ffc107',
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      },
      swipeButtonDelete: {
        backgroundColor: '#dc3545',
      },
      buttonIcon: {
        marginRight: 8,
      },
      searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      searchIcon: {
        marginRight: 10,
      },
      searchInput: {
        flex: 1,
        height: 45,
        fontSize: 16,
        color: '#212529',
      },
      clearButton: {
        padding: 5,
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
      },
      emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
      },
      alertContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
      },
      alertText: {
        color: '#fff',
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '600',
      },
    });