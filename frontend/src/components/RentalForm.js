import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    TextField, Button, Box, Typography,
    Dialog, DialogActions, DialogContent,
    DialogTitle, CircularProgress, Alert
} from '@mui/material';
import axios from '../api/axios';
import { saveAs } from 'file-saver';
import {toast} from "react-toastify";

const RentalForm = ({ vehicle, onClose }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        customerTC: '',
        customerPhone: '',
        endDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `/api/vehicles/${vehicle.id}/rent`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    responseType: 'blob' // DOCX dosyası için
                }
            );

            // Dosya indirme
            const contentDisposition = response.headers['content-disposition'];
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : `sozlesme-${vehicle.plate}.docx`;

            saveAs(new Blob([response.data]), filename);

            onClose(true);
            toast.success('Kiralama işlemi başarılı!');

        } catch (err) {
            let errorMessage = 'Kiralama işlemi başarısız';

            if (err.response) {
                // Backend'den gelen özel mesaj
                if (err.response.data instanceof Blob) {
                    const text = await err.response.data.text();
                    try {
                        const json = JSON.parse(text);
                        errorMessage = json.message || errorMessage;
                    } catch {
                        errorMessage = text || errorMessage;
                    }
                } else {
                    errorMessage = err.response.data?.message || errorMessage;
                }
            }

            setError(errorMessage);
            toast.error(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    const downloadContract = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `/api/vehicles/${vehicle.id}/contract`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    responseType: 'blob' // DOCX dosyası için
                }
            );

            // Dosya indirme
            const contentDisposition = response.headers['content-disposition'];
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : `sozlesme-${vehicle.plate}.docx`;

            saveAs(new Blob([response.data]), filename);
            toast.success('Sözleşme indirildi!');

        } catch (err) {
            let errorMessage = 'Sözleşme indirme başarısız';

            if (err.response) {
                if (err.response.data instanceof Blob) {
                    const text = await err.response.data.text();
                    try {
                        const json = JSON.parse(text);
                        errorMessage = json.message || errorMessage;
                    } catch {
                        errorMessage = text || errorMessage;
                    }
                } else {
                    errorMessage = err.response.data?.message || errorMessage;
                }
            }

            setError(errorMessage);
            toast.error(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open maxWidth="sm" fullWidth>
            <DialogTitle>{vehicle.brand} {vehicle.model} - Kiralama Formu</DialogTitle>
            {error && <Alert severity="error" sx={{ mx: 3 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
                <DialogContent>
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
                            inputProps={{
                                pattern: "[0-9]*",
                                maxLength: 11,
                            }}
                            value={formData.customerTC}
                            onChange={(e) => setFormData({...formData, customerTC: e.target.value})}
                        />
                    </Box>

                    <Box mb={2}>
                        <TextField
                            label="Telefon Numarası"
                            fullWidth
                            required
                            inputProps={{
                                pattern: "[0-9]*",
                                inputMode: "numeric"
                            }}
                            value={formData.customerPhone}
                            onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                        />
                    </Box>

                    <Box mb={2}>
                        <TextField
                            label="Bitiş Tarihi"
                            type="date"
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            inputProps={{
                                min: new Date().toISOString().split('T')[0]
                            }}
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
                        {loading ? <CircularProgress size={24} /> : 'Kirala'}
                    </Button>
                </DialogActions>
                {vehicle.status === 'RENTED' && (
                    <Button
                        variant="outlined"
                        onClick={downloadContract}  // İndirme için ayrı fonksiyon
                        sx={{ mt: 2, ml: 1 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={20} /> : 'Sözleşmeyi İndir'}
                    </Button>
                )}
            </form>
        </Dialog>
    );
};

export default RentalForm