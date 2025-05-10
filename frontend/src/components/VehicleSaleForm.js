import React, { useState } from 'react';
import {
    TextField, Button, Box,
    Dialog, DialogActions, DialogContent,
    DialogTitle, CircularProgress, Alert,
    Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import axios from '../api/axios';
import { toast } from "react-toastify";

const SalesForm = ({ vehicle, open, onClose }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        customerTC: '',
        customerPhone: '',
        salePrice: vehicle?.price || 0,
        paymentMethod: 'CASH',
        saleDate: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await axios.post(
                `/api/vehicles/sale/${vehicle.id}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            onClose(true);
            toast.success('Satış işlemi başarılı!');

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Satış işlemi başarısız';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
                {vehicle?.make} {vehicle?.model} - Satış Formu
            </DialogTitle>

            {error && <Alert severity="error" sx={{ mx: 3 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Box mb={2}>
                        <TextField
                            label="Müşteri Adı Soyadı"
                            fullWidth
                            required
                            value={formData.customerName}
                            onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                        />
                    </Box>

                    <Box mb={2}>
                        <TextField
                            label="TC Kimlik No"
                            fullWidth
                            required
                            inputProps={{ pattern: "[0-9]{11}" }}
                            value={formData.customerTC}
                            onChange={(e) => setFormData({...formData, customerTC: e.target.value})}
                        />
                    </Box>

                    <Box mb={2}>
                        <TextField
                            label="Telefon Numarası"
                            fullWidth
                            required
                            inputProps={{ pattern: "5[0-9]{9}" }}
                            value={formData.customerPhone}
                            onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                        />
                    </Box>

                    <Box mb={2}>
                        <TextField
                            label="Satış Fiyatı"
                            type="number"
                            fullWidth
                            required
                            value={formData.salePrice}
                            onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                            InputProps={{ startAdornment: '₺' }}
                        />
                    </Box>

                    <Box mb={2}>
                        <FormControl fullWidth>
                            <InputLabel>Ödeme Yöntemi</InputLabel>
                            <Select
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                                label="Ödeme Yöntemi"
                                required
                            >
                                <MenuItem value="CASH">Nakit</MenuItem>
                                <MenuItem value="CREDIT">Kredi Kartı</MenuItem>
                                <MenuItem value="LOAN">Kredi</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box mb={2}>
                        <TextField
                            label="Satış Tarihi"
                            type="date"
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            value={formData.saleDate}
                            onChange={(e) => setFormData({...formData, saleDate: e.target.value})}
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => onClose(false)}>İptal</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Satışı Tamamla'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default SalesForm;