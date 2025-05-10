import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import axios from '../api/axios';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: '12px',
    boxShadow: 24,
    p: 4,
};

const VehicleEditModal = ({ open, handleClose, vehicleData, onUpdated }) => {
    const [vehicle, setVehicle] = useState(vehicleData);

    useEffect(() => {
        setVehicle(vehicleData);
    }, [vehicleData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVehicle({ ...vehicle, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/vehicles/${vehicle.id}`, vehicle);
            onUpdated(); // Listeyi yenilemek için
            handleClose();
        } catch (err) {
            alert("Hata: " + err.response?.data?.message || "Bilinmeyen hata");
        }
    };

    if (!vehicle) return null;

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h6" component="h2" mb={2}>
                    Araç Bilgilerini Güncelle
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField label="Marka" name="brand" fullWidth margin="normal" value={vehicle.brand} onChange={handleChange} />
                    <TextField label="Model" name="model" fullWidth margin="normal" value={vehicle.model} onChange={handleChange} />
                    <TextField label="Yıl" type="number" name="year" fullWidth margin="normal" value={vehicle.year} onChange={handleChange} />
                    <TextField label="Plaka" name="plate" fullWidth margin="normal" value={vehicle.plate} onChange={handleChange} />
                    <TextField label="Günlük Fiyat" type="number" name="dailyPrice" fullWidth margin="normal" value={vehicle.dailyPrice} onChange={handleChange} />
                    <TextField label="Kilometre" type="number" name="mileage" fullWidth margin="normal" value={vehicle.mileage} onChange={handleChange} />
                    <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>Güncelle</Button>
                </form>
            </Box>
        </Modal>
    );
};

export default VehicleEditModal;
