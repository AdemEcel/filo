import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Typography,
    Alert,
    IconButton,
    Tooltip, Chip
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import axios from '../api/axios';
import DescriptionIcon from '@mui/icons-material/Description'; // Eksik import eklendi
import { toast } from 'react-toastify'; // Toast bildirimleri için



const RentalHistoryModal = ({ vehicleId }) => {
    const [open, setOpen] = useState(false);
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRentalHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/vehicles/${vehicleId}/rentals`);
            setRentals(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Kiralama geçmişi yüklenemedi');
            console.error('Kiralama geçmişi hatası:', err);
        } finally {
            setLoading(false);
        }
    };
    const downloadContract = async (rentalId) => {
        try {
            const response = await axios.get(`/api/vehicles/${vehicleId}/contracts/${rentalId}`, {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sozlesme-${rentalId}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Sözleşme indirme hatası:', error);
            toast.error('Sözleşme indirilirken hata oluştu');
        }
    };

    const handleOpen = () => {
        setOpen(true);
        fetchRentalHistory();
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Tooltip title="Kiralama Geçmişi">
                <IconButton onClick={handleOpen} color="primary">
                    <HistoryIcon />
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
                <DialogTitle>Kiralama Geçmişi (Araç ID: {vehicleId})</DialogTitle>

                <DialogContent>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                            <CircularProgress />
                        </div>
                    ) : error ? (
                        <Alert severity="error">{error}</Alert>
                    ) : rentals.length === 0 ? (
                        <Typography variant="body1">Bu araca ait kiralama kaydı bulunamadı</Typography>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Fatura No</TableCell>
                                        <TableCell>Müşteri</TableCell>
                                        <TableCell>TC Kimlik</TableCell>
                                        <TableCell>Telefon</TableCell>
                                        <TableCell>Kiralama Süresi</TableCell>
                                        <TableCell>Başlangıç</TableCell>
                                        <TableCell>Planlanan Bitiş</TableCell>
                                        <TableCell>Gerçek Bitiş</TableCell>
                                        <TableCell>Kira Tutarı</TableCell>
                                        <TableCell>Geç Teslim Cezası</TableCell>
                                        <TableCell>Toplam</TableCell>
                                        <TableCell>Durum</TableCell>
                                        <TableCell>Sözleşme</TableCell>                                        <TableCell>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rentals.map((rental) => (
                                        <TableRow key={rental.id}
                                                  sx={{
                                                      backgroundColor: rental.active ? '#f5f5f5' : 'inherit',
                                                      '&:hover': { backgroundColor: '#fafafa' }
                                                  }}
                                        >
                                            <TableCell>{rental.invoiceNumber || '-'}</TableCell>
                                            <TableCell>{rental.customerName}</TableCell>
                                            <TableCell>{rental.customerTC}</TableCell>
                                            <TableCell>{rental.customerPhone}</TableCell>
                                            <TableCell>{rental.duration}</TableCell>
                                            <TableCell>{rental.startDate}</TableCell>
                                            <TableCell>{rental.endDate}</TableCell>
                                            <TableCell>{rental.returnDate || '-'}</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>{rental.formattedBaseAmount}</TableCell>
                                            <TableCell sx={{ color: rental.hasLateFee ? 'error.main' : 'inherit' }}>
                                                {rental.formattedLateFee}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>{rental.formattedTotalAmount}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={rental.status}
                                                    color={
                                                        rental.status === 'Aktif' ? 'primary' :
                                                            rental.status === 'Tamamlandı' ? 'success' : 'warning'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Sözleşmeyi İndir">
                                                    <IconButton
                                                        onClick={() => downloadContract(rental.id)}
                                                        color="primary"
                                                    >
                                                        <DescriptionIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Kapat</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RentalHistoryModal;