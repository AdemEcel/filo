import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress,
    Typography,
    Alert
} from '@mui/material';
import axios from '../api/axios';

const VehicleSaleHistoryModal = ({ vehicleId, open, onClose }) => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSales = async () => {
            if (open && vehicleId) {
                setLoading(true);
                setError(null);
                try {
                    const response = await axios.get(`/api/vehicles/sale/${vehicleId}`);
                    setSales(response.data);
                } catch (err) {
                    setError(err.response?.data?.message || 'Satış geçmişi alınamadı');
                    console.error('API Error:', err);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchSales();
    }, [open, vehicleId]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Araç Satış Geçmişi</DialogTitle>
            <DialogContent>
                {loading && <CircularProgress sx={{ display: 'block', margin: '0 auto' }} />}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!loading && !error && sales.length === 0 ? (
                    <Typography variant="body1" color="textSecondary">
                        Bu araca ait satış kaydı bulunmamaktadır.
                    </Typography>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Müşteri Adı</TableCell>
                                <TableCell>TC</TableCell>
                                <TableCell>Telefon</TableCell>
                                <TableCell>Satış Tarihi</TableCell>
                                <TableCell>Fiyat (₺)</TableCell>
                                <TableCell>Ödeme Yöntemi</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sales.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell>{sale.customerName}</TableCell>
                                    <TableCell>{sale.customerTC}</TableCell>
                                    <TableCell>{sale.customerPhone}</TableCell>
                                    <TableCell>
                                        {new Date(sale.saleDate).toLocaleDateString('tr-TR')}
                                    </TableCell>
                                    <TableCell>
                                        {sale.salePrice.toLocaleString('tr-TR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        {sale.paymentMethod === 'CASH' ? 'Nakit' :
                                            sale.paymentMethod === 'CREDIT' ? 'Kredi Kartı' :
                                                'Kredi'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Kapat
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default VehicleSaleHistoryModal;