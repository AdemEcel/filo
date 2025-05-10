import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip,
    Box,
    IconButton,
    Alert,
    Snackbar
} from '@mui/material';
import AddMaintenanceModal from './AddMaintenanceModal';
import axios from '../api/axios';
import EditIcon from '@mui/icons-material/Edit';
import StatusUpdateModal from './StatusUpdateModal'; // Yeni modal bileşeni

const MaintenanceHistory = ({ vehicleId, refreshVehicleList }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [vehicleStatus, setVehicleStatus] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const getMaintenanceType = (type) => {
        const types = {
            'ROUTINE': 'Rutin Bakım',
            'REPAIR': 'Onarım',
            'ACCIDENT': 'Kaza'
        };
        return types[type] || type;
    };

    const getStatusText = (status) => {
        const statuses = {
            'COMPLETED': 'Tamamlandı',
            'IN_PROGRESS': 'Devam Ediyor',
            'PLANNED': 'Planlanan'
        };
        return statuses[status] || status;
    };

    const fetchMaintenanceHistory = async () => {
        try {
            const response = await axios.get(`/api/maintenance/vehicle/${vehicleId}`);
            setRecords(response.data);
        } catch (error) {
            console.error('Error fetching maintenance history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaintenanceHistory();

        // Araç durumu alınır
        axios.get(`/api/vehicles/${vehicleId}`)
            .then(res => {
                setVehicleStatus(res.data.status); // Örn: "AVAILABLE", "RENTED"
            })
            .catch(err => {
                console.error('Araç durumu alınamadı:', err);
            });
    }, [vehicleId]);

    useEffect(() => {
        fetchMaintenanceHistory();
    }, [vehicleId]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '-';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    };

    const handleAddRecord = (newRecord) => {
        setRecords([...records, newRecord]);
        // Yeni bakım kaydı eklendiğinde araç listesini yenile
        if (refreshVehicleList && typeof refreshVehicleList === 'function') {
            refreshVehicleList();
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'IN_PROGRESS': return 'warning';
            case 'PLANNED': return 'info';
            default: return 'default';
        }
    };

    const handleStatusUpdate = (updatedRecord) => {
        // Bakım kaydını güncelle
        setRecords(records.map(r =>
            r.id === selectedRecord.id ? {...r, status: updatedRecord.status} : r
        ));

        // Bakım durumu güncellendiğinde araç listesini yenile
        if (refreshVehicleList && typeof refreshVehicleList === 'function') {
            refreshVehicleList();
        }

        showSnackbar('Bakım durumu başarıyla güncellendi', 'success');
    };

    return (
        <Box sx={{ mt: 0 }}>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tarih</TableCell>
                            <TableCell>Tip</TableCell>
                            <TableCell>Açıklama</TableCell>
                            <TableCell>Maliyet</TableCell>
                            <TableCell>Servis</TableCell>
                            <TableCell>Kilometre</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell>İşlem</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">Yükleniyor...</TableCell>
                            </TableRow>
                        ) : records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">Kayıt bulunamadı</TableCell>
                            </TableRow>
                        ) : (
                            records.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>
                                        {new Date(record.maintenanceDate).toLocaleDateString('tr-TR')}
                                    </TableCell>
                                    <TableCell>
                                        {record.maintenanceType === 'ROUTINE' ? 'Rutin Bakım' :
                                            record.maintenanceType === 'REPAIR' ? 'Onarım' : 'Kaza'}
                                    </TableCell>
                                    <TableCell>{record.description || '-'}</TableCell>
                                    <TableCell>
                                        {record.cost ? `₺${record.cost.toLocaleString('tr-TR')}` : '-'}
                                    </TableCell>
                                    <TableCell>{record.serviceCenter || '-'}</TableCell>
                                    <TableCell>
                                        {record.mileage ? record.mileage.toLocaleString('tr-TR') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={
                                                record.status === 'COMPLETED' ? 'Tamamlandı' :
                                                    record.status === 'IN_PROGRESS' ? 'Devam Ediyor' : 'Planlanan'
                                            }
                                            color={
                                                record.status === 'COMPLETED' ? 'success' :
                                                    record.status === 'IN_PROGRESS' ? 'warning' : 'info'
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {vehicleStatus !== 'RENTED' && vehicleStatus !== 'SOLD' && vehicleStatus !== 'FOR_SALE' && (
                                            <IconButton
                                                onClick={() => setSelectedRecord(record)}
                                                size="small"
                                                title="Durumu Güncelle"
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        )}

                                    </TableCell>

                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <AddMaintenanceModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                vehicleId={vehicleId}
                onAdd={handleAddRecord}
                refreshVehicleList={refreshVehicleList}
            />

            <StatusUpdateModal
                open={Boolean(selectedRecord)}
                onClose={() => setSelectedRecord(null)}
                record={selectedRecord}
                onUpdate={handleStatusUpdate}
                fetchData={fetchMaintenanceHistory}
                refreshVehicleList={refreshVehicleList}
            />
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MaintenanceHistory;