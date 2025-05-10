import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, Typography, Box, TextField, Grid,
    CircularProgress, useTheme
} from '@mui/material';
import {
    Sell as SellIcon,
    AttachMoney as MoneyIcon,
    DirectionsCar as CarIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import VehicleSaleForm from './VehicleSaleForm';
import axios from '../api/axios';

const statusColors = {
    AVAILABLE: 'success.main',
    FOR_SALE: 'warning.main',
    RENTED: 'error.main',
    IN_MAINTENANCE: 'info.main',
    SOLD: 'text.secondary'
};

export default function ForSaleVehicles() {
    const theme = useTheme();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [saleFormOpen, setSaleFormOpen] = useState(false);
    const [filters, setFilters] = useState({
        maxAge: 10,
        minMileage: 100000
    });

    const fetchEligibleVehicles = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/vehicles/sale/eligible', {
                params: filters
            });
            setVehicles(response.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const markForSale = async (vehicleId) => {
        try {
            await axios.post(`/api/vehicles/sale/${vehicleId}/mark-for-sale`);
            fetchEligibleVehicles();
        } catch (error) {
            console.error('Error marking vehicle for sale:', error);
        }
    };

    const removeFromSale = async (vehicleId) => {
        try {
            // Aracın durumunu FOR_SALE'den AVAILABLE'a değiştiren API çağrısı
            await axios.post(`/api/vehicles/sale/${vehicleId}/remove-from-sale`);
            // API çağrısı başarılı olursa araçları yeniden yükle
            fetchEligibleVehicles();
        } catch (error) {
            console.error('Error removing vehicle from sale:', error);
        }
    };

    const handleSell = async (saleData) => {
        try {
            await axios.post(`/api/vehicles/sale/${saleData.vehicleId}/sell`, saleData);
            fetchEligibleVehicles();
        } catch (error) {
            console.error('Error selling vehicle:', error);
        }
    };

    useEffect(() => {
        fetchEligibleVehicles();
    }, [filters]);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <SellIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Satışa Uygun Araçlar
                </Typography>
            </Box>

            <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Maksimum Yaş (Yıl)"
                            type="number"
                            fullWidth
                            value={filters.maxAge}
                            onChange={(e) => setFilters({...filters, maxAge: e.target.value})}
                            InputProps={{
                                inputProps: { min: 1 }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Minimum Kilometre (km)"
                            type="number"
                            fullWidth
                            value={filters.minMileage}
                            onChange={(e) => setFilters({...filters, minMileage: e.target.value})}
                            InputProps={{
                                inputProps: { min: 0 }
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead sx={{ bgcolor: theme.palette.primary.light }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Marka</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Model</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Yıl</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Kilometre</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Durum</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {vehicles.map((vehicle) => (
                                <TableRow key={vehicle.id} hover>
                                    <TableCell>{vehicle.brand}</TableCell>
                                    <TableCell>{vehicle.model}</TableCell>
                                    <TableCell>{vehicle.year}</TableCell>
                                    <TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
                                    <TableCell sx={{ color: statusColors[vehicle.status] || 'text.primary' }}>
                                        {vehicle.status}
                                    </TableCell>
                                    <TableCell>
                                        {vehicle.status === 'AVAILABLE' ? (
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                startIcon={<SellIcon />}
                                                onClick={() => markForSale(vehicle.id)}
                                                size="small"
                                            >
                                                Satışa Çıkar
                                            </Button>
                                        ) : vehicle.status === 'FOR_SALE' ? (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={<MoneyIcon />}
                                                    onClick={() => {
                                                        setSelectedVehicle(vehicle);
                                                        setSaleFormOpen(true);
                                                    }}
                                                    size="small"
                                                >
                                                    Satış Yap
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<CancelIcon />}
                                                    onClick={() => removeFromSale(vehicle.id)}
                                                    size="small"
                                                >
                                                    Satıştan Kaldır
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                İşlem Yapılamaz
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <VehicleSaleForm
                vehicle={selectedVehicle}
                open={saleFormOpen}
                onClose={() => setSaleFormOpen(false)}
                onSubmit={handleSell}
            />
        </Box>
    );
}