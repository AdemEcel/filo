import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Chip, Box } from '@mui/material';
import { format, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';

const UpcomingMaintenances = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                const response = await axios.get('/api/maintenance/upcoming');
                setRecords(response.data);
            } catch (error) {
                console.error('Yaklaşan bakımlar alınamadı:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUpcoming();
    }, []);

    const getMaintenanceUrgency = (dateString) => {
        const maintenanceDate = new Date(dateString);
        const today = new Date();
        const daysUntil = differenceInDays(maintenanceDate, today);

        if (daysUntil <= 2) return { color: 'error', label: 'Acil' };
        if (daysUntil <= 7) return { color: 'warning', label: 'Yakında' };
        return { color: 'success', label: 'Planlandı' };
    };

    const formatMaintenanceDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, 'dd MMMM yyyy', { locale: tr });
        } catch (error) {
            return 'Geçersiz tarih';
        }
    };

    return (
        <Card sx={{ mt: 4 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Yaklaşan Bakımlar (2 Hafta İçinde)
                </Typography>
                {loading ? (
                    <Typography>Yükleniyor...</Typography>
                ) : records.length === 0 ? (
                    <Typography>Yaklaşan bakım kaydı yok.</Typography>
                ) : (
                    <List>
                        {records.map((record) => {
                            const urgency = getMaintenanceUrgency(record.nextMaintenanceDate);

                            return (
                                <ListItem
                                    key={record.id}
                                    divider
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'flex-start', sm: 'center' },
                                        gap: 1
                                    }}
                                >
                                    <ListItemText
                                        primary={`${record.vehiclePlate} - ${record.maintenanceType}`}
                                        secondary={`Tarih: ${formatMaintenanceDate(record.nextMaintenanceDate)}`}
                                        sx={{ flexGrow: 1 }}
                                    />
                                    <Box>
                                        <Chip
                                            label={urgency.label}
                                            color={urgency.color}
                                            size="small"
                                            sx={{ minWidth: 80 }}
                                        />
                                    </Box>
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </CardContent>
        </Card>
    );
};

export default UpcomingMaintenances;