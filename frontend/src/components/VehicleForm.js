import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    Typography,
    Grid,
    Alert,
    IconButton,
    InputAdornment,
    useTheme
} from '@mui/material';
import {
    DirectionsCar as CarIcon,
    CheckCircle as CheckIcon,
    Close as CloseIcon
} from '@mui/icons-material';


const VehicleForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: '',
        plate: '',
        mileage: '',
        dailyPrice: '',
    });
    const theme = useTheme();


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            year: parseInt(formData.year),
            mileage: parseInt(formData.mileage),
            dailyPrice: parseFloat(formData.dailyPrice),
            available: true
        });
        setFormData({
            brand: '',
            model: '',
            year: '',
            plate: '',
            mileage: '',
            dailyPrice: '',
        });
    };

    const clearForm = () => {
        setFormData({
            brand: '',
            model: '',
            year: '',
            plate: '',
            mileage: '',
            dailyPrice: '',
        });
    };

    return (
        <Card sx={{
            borderRadius: 2,
            boxShadow: theme.shadows[3],
            transition: 'box-shadow 0.3s',
            '&:hover': {
                boxShadow: theme.shadows[6]
            }
        }}>
            <CardContent>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 3
                }}>
                    <CarIcon color="primary" fontSize="large" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Yeni Araç Ekle
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Marka"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                required
                                variant="outlined"
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CarIcon color="action" fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Model"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                required
                                variant="outlined"
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Yıl"
                                name="year"
                                type="number"
                                value={formData.year}
                                onChange={handleChange}
                                required
                                variant="outlined"
                                size="small"
                                inputProps={{
                                    min: 1990,
                                    max: new Date().getFullYear() + 1
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Plaka"
                                name="plate"
                                value={formData.plate}
                                onChange={handleChange}
                                required
                                variant="outlined"
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Kilometre (km)"
                                name="mileage"
                                type="number"
                                value={formData.mileage}
                                onChange={handleChange}
                                required
                                variant="outlined"
                                size="small"
                                inputProps={{ min: 0 }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Günlük Fiyat (₺)"
                                name="dailyPrice"
                                type="number"
                                step="0.01"
                                value={formData.dailyPrice}
                                onChange={handleChange}
                                required
                                variant="outlined"
                                size="small"
                                inputProps={{ min: 0 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            ₺
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                                height: '100%',
                                alignItems: 'center'
                            }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    sx={{ height: 40 }}
                                >
                                    Kaydet
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    fullWidth
                                    onClick={clearForm}
                                    sx={{ height: 40 }}
                                >
                                    Temizle
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>
    );
};


export default VehicleForm;