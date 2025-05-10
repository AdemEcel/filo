import React, { useState } from 'react';
import {
    Button,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    Typography,
    Box,
    Divider,
    Paper
} from '@mui/material';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import UndoIcon from '@mui/icons-material/Undo';
import RentalForm from './RentalForm';
import AddIcon from "@mui/icons-material/Add";

const VehicleActions = ({ vehicle, refreshData }) => {
    const [showRentalForm, setShowRentalForm] = useState(false);
    const [showReturnDialog, setShowReturnDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [invoice, setInvoice] = useState(null);

    const handleReturnClick = () => {
        setShowReturnDialog(true);
        setInvoice(null);
        setError(null);
    };

    const handleReturnConfirm = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `/api/vehicles/${vehicle.id}/return`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            setInvoice(response.data);
            toast.success('Araç başarıyla teslim alındı');
        } catch (err) {
            console.error('Return Error:', err); // ekleyin
            const errorMessage = err.response?.data?.message || err.message || 'Araç teslim alma işlemi başarısız oldu';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseReturnDialog = () => {
        setShowReturnDialog(false);
        if (invoice && typeof refreshData === 'function') {
            refreshData();
        }
    };

    return (
        <>
            {vehicle.status === 'AVAILABLE' ? (
                <Tooltip title="Aracı Kirala">
                    <IconButton
                        color="primary"
                        onClick={() => setShowRentalForm(true)}
                    >
                        <AddIcon />
                    </IconButton>
                </Tooltip>
            ) : vehicle.status === 'RENTED' ? (
                <Tooltip title="Teslim Al">
                    <IconButton
                        color="error"
                        onClick={handleReturnClick}
                    >
                        <UndoIcon />
                    </IconButton>
                </Tooltip>
            ) : null}

            {showRentalForm && (
                <RentalForm
                    vehicle={vehicle}
                    onClose={(success) => {
                        setShowRentalForm(false);
                        if (success) {
                            toast.success('Kiralama işlemi başarılı');
                            refreshData();
                        }
                    }}
                />
            )}

            <Dialog open={showReturnDialog} maxWidth="md" fullWidth onClose={handleCloseReturnDialog}>
                <DialogTitle>{vehicle.brand} {vehicle.model} - Araç Teslim Alma</DialogTitle>

                {error && <Alert severity="error" sx={{ mx: 3, mb: 2 }}>{error}</Alert>}

                {!invoice ? (
                    <DialogContent>
                        <Typography variant="body1" paragraph>
                            {vehicle.plate} plakalı aracı teslim almak istediğinize emin misiniz?
                        </Typography>
                        <Alert severity="info">
                            Planlanan teslim tarihinden sonra teslim alınırsa, geç teslim cezası uygulanacaktır.
                        </Alert>
                    </DialogContent>
                ) : (
                    <DialogContent>
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Fatura Bilgileri</Typography>
                            <Typography variant="subtitle2">Fatura No: {invoice.invoiceNumber}</Typography>
                            <Typography variant="subtitle2">Tarih: {new Date(invoice.issueDate).toLocaleDateString()}</Typography>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2">Araç: {invoice.vehiclePlate}</Typography>
                                <Typography variant="body2">Günlük Kiralama Ücreti: {vehicle.dailyPrice} TL</Typography>
                                <Typography variant="body2">Kiralama Süresi: {invoice.rentalDays} gün</Typography>
                            </Box>


                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Kiralama Tutarı:</Typography>
                                <Typography variant="body2">{invoice.baseAmount} TL</Typography>
                            </Box>
                            {invoice.lateFee > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="error">
                                        Açıklama:
                                    </Typography>
                                    <Typography variant="body2" color="error">{invoice.lateFeeDescription} </Typography>
                                </Box>
                            )}

                            {invoice.lateFee > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="error">
                                        Geç Teslim Cezası:
                                    </Typography>
                                    <Typography variant="body2" color="error">{invoice.lateFee} TL</Typography>
                                </Box>
                            )}

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" fontWeight="bold">TOPLAM:</Typography>
                                <Typography variant="subtitle1" fontWeight="bold">{invoice.totalAmount} TL</Typography>
                            </Box>
                        </Paper>
                    </DialogContent>
                )}

                <DialogActions>
                    {!invoice ? (
                        <>
                            <Button onClick={handleCloseReturnDialog}>İptal</Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleReturnConfirm}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Teslim Al'}
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCloseReturnDialog}
                        >
                            Kapat
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default VehicleActions;