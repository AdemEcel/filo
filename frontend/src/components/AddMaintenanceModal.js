import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isBefore } from 'date-fns';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Grid,
    CircularProgress,
    Alert,
    useTheme,
    Fade,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import axios from '../api/axios';
import {
    Build as MaintenanceIcon,
    CalendarToday as CalendarIcon,
    Description as DescriptionIcon,
    AttachMoney as CostIcon,
    DirectionsCar as MileageIcon,
    Business as ServiceCenterIcon,
    EventAvailable as NextMaintenanceIcon
} from '@mui/icons-material';

const modalStyle = (theme) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 600 },
    bgcolor: 'background.paper',
    boxShadow: theme.shadows[10],
    p: 4,
    borderRadius: 2,
    maxHeight: '90vh',
    overflowY: 'auto'
});

const AddMaintenanceModal = ({ open, onClose, vehicle, refreshVehicleList }) => {
    const theme = useTheme();
    const [formData, setFormData] = useState({
        maintenanceDate: new Date(),
        maintenanceType: 'ROUTINE',
        description: '',
        cost: '',
        serviceCenter: '',
        nextMaintenanceDate: null,
        mileage: '',
        status: 'COMPLETED'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date, field) => {
        if (field === 'nextMaintenanceDate' && date && isBefore(date, new Date())) {
            setError('Sonraki bakım tarihi geçmiş bir tarih olamaz');
            return;
        }
        setError('');
        setFormData(prev => ({ ...prev, [field]: date }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                vehicleId: vehicle.id,
                cost: parseFloat(formData.cost),
                mileage: formData.mileage ? parseInt(formData.mileage) : null,
                nextMaintenanceDate: (formData.maintenanceType === 'ROUTINE' || formData.status === 'PLANNED')
                    ? formData.nextMaintenanceDate
                    : null
            };

            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token bulunamadı');

            await axios.post(`${process.env.REACT_APP_API_URL}/api/maintenance`, payload, {
                headers: { 'Authorization': `Bearer ${token.replace('Bearer ', '')}` }
            });

            // Bakım ekleme başarılı olduğunda araç listesini yenile
            if (refreshVehicleList) {
                await refreshVehicleList();
            }

            onClose(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Bakım kaydı eklenirken bir hata oluştu');
            console.error('Bakım kaydı ekleme hatası:', err);
        } finally {
            setLoading(false);
        }
    };


    const showNextMaintenance = formData.maintenanceType === 'ROUTINE' || formData.status === 'PLANNED';

    return (
        <Modal open={open} onClose={() => !loading && onClose()}>
            <Box sx={modalStyle(theme)}>
                <Typography variant="h5" gutterBottom sx={{
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <MaintenanceIcon fontSize="medium" />
                    {vehicle?.plateNumber} - Yeni Bakım Kaydı
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Bakım Tarihi"
                                    value={formData.maintenanceDate}
                                    onChange={(date) => handleDateChange(date, 'maintenanceDate')}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <CalendarIcon color="action" sx={{ mr: 1 }} />
                                                ),
                                            }}
                                        />
                                    )}
                                    inputFormat="dd/MM/yyyy"
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Bakım Tipi</InputLabel>
                                <Select
                                    name="maintenanceType"
                                    value={formData.maintenanceType}
                                    label="Bakım Tipi"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="ROUTINE">Rutin Bakım</MenuItem>
                                    <MenuItem value="REPAIR">Onarım</MenuItem>
                                    <MenuItem value="ACCIDENT">Kaza</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Açıklama"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                InputProps={{
                                    startAdornment: (
                                        <DescriptionIcon color="action" sx={{ mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Maliyet (₺)"
                                name="cost"
                                type="number"
                                value={formData.cost}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <CostIcon color="action" sx={{ mr: 1 }} />
                                    ),
                                    inputProps: { min: 0, step: 0.01 }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Kilometre (km)"
                                name="mileage"
                                type="number"
                                value={formData.mileage}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <MileageIcon color="action" sx={{ mr: 1 }} />
                                    ),
                                    inputProps: { min: 0 }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Durum</InputLabel>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    label="Durum"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="COMPLETED">Tamamlandı</MenuItem>
                                    <MenuItem value="IN_PROGRESS">Devam Ediyor</MenuItem>
                                    <MenuItem value="PLANNED">Planlanan</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Servis Merkezi"
                                name="serviceCenter"
                                value={formData.serviceCenter}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <ServiceCenterIcon color="action" sx={{ mr: 1 }} />
                                    ),
                                }}
                            />
                        </Grid>
                        <Fade in={showNextMaintenance}>
                            <Grid item xs={12} sm={6}>
                                {showNextMaintenance && (
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            label="Sonraki Bakım Tarihi"
                                            value={formData.nextMaintenanceDate}
                                            onChange={(date) => handleDateChange(date, 'nextMaintenanceDate')}
                                            minDate={new Date()}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    required={showNextMaintenance}
                                                    error={Boolean(error)}
                                                    helperText={error}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <NextMaintenanceIcon color="action" sx={{ mr: 1 }} />
                                                        ),
                                                    }}
                                                />
                                            )}
                                            inputFormat="dd/MM/yyyy"
                                        />
                                    </LocalizationProvider>
                                )}
                            </Grid>
                        </Fade>
                    </Grid>

                    <Box sx={{
                        mt: 4,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2,
                        flexWrap: 'wrap'
                    }}>
                        <Button
                            onClick={() => onClose()}
                            disabled={loading}
                            variant="outlined"
                            sx={{ minWidth: 120 }}
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{ minWidth: 120 }}
                            startIcon={loading ? <CircularProgress size={20} /> : null}
                        >
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
};

export default AddMaintenanceModal;