import React, { useState, useEffect } from 'react';
import VehicleForm from './VehicleForm';
import PropTypes from 'prop-types';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    InputAdornment,
    IconButton,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Chip,
    Button,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    Add as AddIcon,
    History as HistoryIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AddMaintenanceModal from './AddMaintenanceModal';
import VehicleActions from './VehicleActions';
import RentalHistoryModal from './RentalHistoryModal';
import MaintenanceHistoryModal from './MaintenanceHistoryModal';
import VehicleSaleHistoryModal from './VehicleSaleHistoryModal';
import VehicleEditModal from './VehicleEditModal';
import { toast } from 'react-toastify';
import axios from '../api/axios';

const statusConfig = {
    AVAILABLE: { label: 'Müsait', color: 'success' },
    RENTED: { label: 'Kiralandı', color: 'error' },
    IN_MAINTENANCE: { label: 'Bakımda', color: 'warning' },
    FOR_SALE: { label: 'Satışta', color: 'warning' },
    SOLD: { label: 'Satıldı', color: 'error' },
    default: { label: 'Bilinmiyor', color: 'default' },
};

const VehicleList = ({
                         vehicles,
                         loading,
                         error,
                         showForm,
                         setShowForm,
                         onAddVehicle,
                         hasRole,
                         fetchVehicles
                     }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openSaleModal, setOpenSaleModal] = useState(false);
    const [saleVehicleId, setSaleVehicleId] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleEditOpen = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsEditOpen(true);
    };

    const handleEditClose = () => {
        setIsEditOpen(false);
        setSelectedVehicle(null);
    };

    const handleOpenModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedVehicle(null);
    };

    const handleOpenSaleModal = (vehicleId) => {
        setSaleVehicleId(vehicleId);
        setOpenSaleModal(true);
    };

    const handleCloseSaleModal = () => {
        setOpenSaleModal(false);
        setSaleVehicleId(null);
    };

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredVehicles(vehicles);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = vehicles.filter(vehicle =>
                vehicle.brand.toLowerCase().includes(term) ||
                vehicle.model.toLowerCase().includes(term) ||
                vehicle.plate.toLowerCase().includes(term) ||
                vehicle.year.toString().includes(term) ||
                vehicle.dailyPrice.toString().includes(term)
            );
            setFilteredVehicles(filtered);
        }
    }, [searchTerm, vehicles]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const handleDeleteClick = (vehicle) => {
        setVehicleToDelete(vehicle);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            await axios.delete(`/api/vehicles/${vehicleToDelete.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Araç ve tüm bağlı kayıtlar (kiralama, satış, bakım) silindi');
            fetchVehicles();
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.response?.data ||
                'Silme işlemi başarısız oldu';
            toast.error(errorMessage);
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    const renderStatusChip = (status) => {
        const config = statusConfig[status] || statusConfig.default;
        return (
            <Chip
                label={config.label}
                color={config.color}
                size="small"
            />
        );
    };

    const renderActionButtons = (vehicle) => {
        if (!hasRole('ROLE_ADMIN') && !hasRole('ROLE_EMPLOYEE')) return null;

        return (
            <>
                <TableCell>
                    <VehicleActions
                        vehicle={vehicle}
                        refreshData={fetchVehicles}
                    />
                    <RentalHistoryModal vehicleId={vehicle.id} />
                </TableCell>
                <TableCell>
                    {vehicle.status !== 'RENTED' && vehicle.status !== 'SOLD' &&(
                        <Tooltip title="Bakım Ekle">
                            <IconButton
                                color="primary"
                                onClick={() => handleOpenModal(vehicle)}
                            >
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    <MaintenanceHistoryModal
                        vehicleId={vehicle.id}
                        refreshVehicleList={fetchVehicles}
                    />
                </TableCell>
                <TableCell>
                    <Stack direction="row" spacing={1}>
                        {vehicle.status === 'SOLD' && (
                            <Tooltip title="Satış Geçmişi">
                                <IconButton
                                    color="secondary"
                                    onClick={() => handleOpenSaleModal(vehicle.id)}
                                >
                                    <HistoryIcon />
                                </IconButton>
                            </Tooltip>
                        )}

                        {hasRole('ROLE_ADMIN') && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteClick(vehicle)}
                            size="small"
                        >
                            Sil
                        </Button>
                        )}

                        {hasRole('ROLE_ADMIN') && (
                        <Tooltip title="Düzenle">
                            <IconButton
                                color="info"
                                onClick={() => handleEditOpen(vehicle)}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        )}
                    </Stack>
                </TableCell>
            </>
        );
    };

    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
                    Araç Listesi
                </Typography>

                {hasRole('ROLE_ADMIN') && (
                    <Button
                        variant="contained"
                        onClick={() => setShowForm(!showForm)}
                        sx={{ borderRadius: 1 }}
                        startIcon={<AddIcon />}
                    >
                        {showForm ? 'Formu Kapat' : 'Yeni Araç Ekle'}
                    </Button>
                )}
            </Box>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Marka, model, plaka veya yıl ara..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                        <IconButton onClick={clearSearch} edge="end">
                            <ClearIcon />
                        </IconButton>
                    )
                }}
                sx={{ mb: 3 }}
            />

            {showForm && hasRole('ROLE_ADMIN') && (
                <Box sx={{ mb: 4 }}>
                    <VehicleForm onSubmit={onAddVehicle} />
                </Box>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            ) : (
                <>
                    {filteredVehicles.length === 0 ? (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            {searchTerm
                                ? 'Arama kriterlerinize uygun araç bulunamadı'
                                : 'Listelenecek araç bulunmuyor'}
                        </Alert>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead sx={{ bgcolor: 'primary.light' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Marka</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Model</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Yıl</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Plaka</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Kilometre</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Günlük Fiyat</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Durum</TableCell>
                                        {(hasRole('ROLE_ADMIN') || hasRole('ROLE_EMPLOYEE')) && (
                                            <>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Kiralama İşlemleri</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Bakım İşlemleri</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Araç İşlemleri</TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredVehicles.map((vehicle) => (
                                        <TableRow key={vehicle.id} hover>
                                            <TableCell>{vehicle.brand}</TableCell>
                                            <TableCell>{vehicle.model}</TableCell>
                                            <TableCell>{vehicle.year}</TableCell>
                                            <TableCell>{vehicle.plate}</TableCell>
                                            <TableCell>{vehicle.mileage}</TableCell>
                                            <TableCell>{vehicle.dailyPrice.toFixed(2)} ₺</TableCell>
                                            <TableCell>
                                                {renderStatusChip(vehicle.status)}
                                            </TableCell>
                                            {renderActionButtons(vehicle)}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <DeleteConfirmationDialog
                                open={deleteDialogOpen}
                                onClose={() => setDeleteDialogOpen(false)}
                                onConfirm={confirmDelete}
                                deleting={deleting}
                                vehicle={vehicleToDelete}
                            />
                        </TableContainer>
                    )}
                </>
            )}

            {selectedVehicle && (
                <AddMaintenanceModal
                    open={openModal}
                    onClose={handleCloseModal}
                    vehicle={selectedVehicle}
                    refreshVehicleList={fetchVehicles}  // Bu satırı ekleyin
                />
            )}

            {saleVehicleId && (
                <VehicleSaleHistoryModal
                    open={openSaleModal}
                    onClose={handleCloseSaleModal}
                    vehicleId={saleVehicleId}
                />
            )}

            <VehicleEditModal
                open={isEditOpen}
                handleClose={handleEditClose}
                vehicleData={selectedVehicle}
                onUpdated={fetchVehicles}
            />
        </Paper>
    );
};

const DeleteConfirmationDialog = ({ open, onClose, onConfirm, deleting, vehicle }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Aracı Sil</DialogTitle>
        <DialogContent>
            <Typography>
                {vehicle?.brand} {vehicle?.model} aracını silmek istediğinize emin misiniz?
            </Typography>
            <Typography variant="body2" color="error" mt={2}>
                Bu işlem aracın tüm satış ve bakım kayıtlarını da silecektir!
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>İptal</Button>
            <Button
                onClick={onConfirm}
                color="error"
                variant="contained"
                disabled={deleting}
            >
                {deleting ? <CircularProgress size={24} /> : 'Sil'}
            </Button>
        </DialogActions>
    </Dialog>
);

DeleteConfirmationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    deleting: PropTypes.bool.isRequired,
    vehicle: PropTypes.object,
};

VehicleList.propTypes = {
    vehicles: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string,
    showForm: PropTypes.bool.isRequired,
    setShowForm: PropTypes.func.isRequired,
    onAddVehicle: PropTypes.func.isRequired,
    hasRole: PropTypes.func.isRequired,
    fetchVehicles: PropTypes.func.isRequired
};

export default VehicleList;