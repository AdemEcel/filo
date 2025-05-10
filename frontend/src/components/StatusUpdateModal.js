import React, { useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress
} from '@mui/material';
import axios from '../api/axios';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const StatusUpdateModal = ({ open, onClose, record, onUpdate, fetchData, refreshVehicleList }) => {
    const [status, setStatus] = useState(record?.status || '');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);


    const handleSubmit = async () => {
        try {
            setLoading(true);
            const response = await axios.patch(`/api/maintenance/${record.id}/status`, { status });
            onUpdate(response.data); // Backend'den gelen güncel veri
            fetchData(); // Bakım verilerini güncelle

            // Araç listesini yenile
            if (refreshVehicleList && typeof refreshVehicleList === 'function') {
                refreshVehicleList();
            }
        } catch (error) {
            console.error('Durum güncelleme hatası:', error);
        } finally {
            setLoading(false);
            onClose();
        }
    };



    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <Typography variant="h6" gutterBottom>
                    Bakım Durumu Güncelle
                </Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Durum</InputLabel>
                    <Select
                        value={status}
                        label="Durum"
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={loading}
                    >
                        <MenuItem value="PLANNED">Planlanan</MenuItem>
                        <MenuItem value="IN_PROGRESS">Devam Ediyor</MenuItem>
                        <MenuItem value="COMPLETED">Tamamlandı</MenuItem>
                    </Select>
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={onClose} disabled={loading}>İptal</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Güncelle'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};
export default StatusUpdateModal;