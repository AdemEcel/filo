import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Tooltip
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import MaintenanceHistory from './MaintenanceHistory';
import HistoryIcon from "@mui/icons-material/History";

const MaintenanceHistoryModal = ({ vehicleId, refreshVehicleList }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <Tooltip title="Bakım Geçmişi">
                <IconButton onClick={handleOpen} color="primary">
                    <HistoryIcon />
                </IconButton>
            </Tooltip>

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="lg"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        maxHeight: '80vh'
                    }
                }}
                fullScreen={window.innerWidth < 600}
                scroll="paper"
            >
                <DialogTitle>Bakım Geçmişi (Araç ID: {vehicleId})</DialogTitle>
                <DialogContent dividers>
                    <MaintenanceHistory vehicleId={vehicleId} refreshVehicleList={refreshVehicleList} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="contained">Kapat</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default MaintenanceHistoryModal;