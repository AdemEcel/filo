import React, { useContext, useEffect, useState } from 'react';
import {
    Typography,
    Box,
    Paper,
    Grid,
    Alert,
    Snackbar,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Card,
    CardContent,
    Stack,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Select,
    MenuItem,
    TextField,
    InputAdornment,
    IconButton,
    useTheme
} from '@mui/material';
import {
    DirectionsCar as CarIcon,
    Home as HomeIcon,
    Build as MaintenanceIcon,
    Assignment as RentalIcon,
    People as UsersIcon,
    Lock as AdminIcon,
    Person as UserIcon,
    Engineering as EmployeeIcon,
    ExitToApp as LogoutIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    CheckCircle as CheckCircleIcon,
    Sell as SellIcon
} from '@mui/icons-material';
import AuthContext from '../context/AuthContext';
import VehicleList from '../components/VehicleList';
import axios from 'axios';
import UpcomingMaintenances from "../components/UpcomingMaintenances";
import ForSaleVehicles from '../components/ForSaleVehicles';

// Constants
const DRAWER_WIDTH = 240;
const SNACKBAR_AUTO_HIDE_DURATION = 6000;

const HomePage = () => {
    const theme = useTheme();
    const { user, logout } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState('all');
    const [stats, setStats] = useState({
        totalVehicles: 0,
        vehiclesInMaintenance: 0,
        vehiclesInRental: 0,
        availableVehicles: 0,
        vehiclesForSale: 0,
        vehiclesSold: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const hasRole = (roleName) => {
        if (!user || !user.roles) return false;
        return user.roles.some(role =>
            role === roleName ||
            role === roleName.replace('ROLE_', '').toLowerCase() ||
            role === roleName.replace('ROLE_', '')
        );
    };

    // Data fetching effects
    useEffect(() => {
        fetchVehicles();
    }, []);

    useEffect(() => {
        if (hasRole('ROLE_ADMIN')) {
            fetchUsers();
        }
    }, []);

    useEffect(() => {
        if (vehicles.length > 0) {
            updateVehicleStats();
        }
    }, [vehicles]);

    // Data fetching functions
    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token bulunamadı');

            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/vehicles`, {
                headers: { 'Authorization': `Bearer ${token.replace('Bearer ', '')}` }
            });

            setVehicles(response.data);
            setError(null);
        } catch (err) {
            console.error('Araçlar yüklenirken hata:', err);
            setError('Araçlar yüklenirken bir hata oluştu');
            if (err.response?.status === 401) logout();
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token bulunamadı');

            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
                headers: { 'Authorization': `Bearer ${token.replace('Bearer ', '')}` }
            });

            setUsers(response.data);
        } catch (err) {
            console.error('Kullanıcılar yüklenirken hata:', err);
            showSnackbar('Kullanıcılar yüklenirken bir hata oluştu', 'error');
            if (err.response?.status === 401) logout();
        }
    };

    const updateVehicleStats = () => {
        const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
        const vehiclesForSale = vehicles.filter(v => v.status === 'FOR_SALE').length;
        const vehiclesSold = vehicles.filter(v => v.status === 'SOLD').length;
        const vehiclesInMaintenance = vehicles.filter(v => v.status === 'IN_MAINTENANCE').length;
        const vehiclesInRental = vehicles.filter(v => v.status === 'RENTED').length;

        setStats({
            totalVehicles: vehicles.length,
            availableVehicles,
            vehiclesInMaintenance,
            vehiclesInRental,
            vehiclesForSale,
            vehiclesSold,
        });
        setStatsLoading(false);
    };

    // User management functions
    const handleRoleChange = async (userId, newRole) => {
        try {
            const userToUpdate = users.find(u => u.id === userId);

            if (userToUpdate.username === 'admin') {
                showSnackbar('Admin kullanıcısının rolü değiştirilemez', 'error');
                return;
            }

            await axios.put(`${process.env.REACT_APP_API_URL}/api/users/${userId}/roles`, [newRole], {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            const updatedUsers = users.map(u =>
                u.id === userId ? { ...u, roles: [newRole] } : u
            );

            setUsers(updatedUsers);
            showSnackbar('Kullanıcı rolü başarıyla güncellendi', 'success');
        } catch (err) {
            console.error('Rol güncelleme hatası:', err);
            showSnackbar(err.response?.data?.message || 'Rol güncelleme başarısız', 'error');
        }
    };

    // Search and filter functions
    useEffect(() => {
        let filtered = users;

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.id.toString().includes(searchTerm)
            );
        }

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user =>
                user.roles.some(role =>
                    getRoleDisplayName(role) === roleFilter
                )
            );
        }

        setFilteredUsers(filtered);
    }, [searchTerm, users, roleFilter]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    // Helper functions
    const getRoleDisplayName = (role) => {
        const roleName = typeof role === 'string' ? role : role.name;
        return roleName.replace('ROLE_', '').toLowerCase();
    };

    const getRoleIcon = (role) => {
        const roleName = getRoleDisplayName(role);
        switch(roleName) {
            case 'admin': return <AdminIcon color="error" />;
            case 'employee': return <EmployeeIcon color="primary" />;
            default: return <UserIcon color="action" />;
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleAddVehicle = async (vehicleData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token bulunamadı');

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/vehicles`, vehicleData, {
                headers: {
                    'Authorization': `Bearer ${token.replace('Bearer ', '')}`,
                    'Content-Type': 'application/json'
                }
            });

            setVehicles(prev => [...prev, response.data]);
            setShowForm(false);
            showSnackbar('Araç başarıyla eklendi', 'success');
        } catch (error) {
            console.error('Hata:', error);
            showSnackbar(error.response?.data?.message || 'Bu plaka mevcut!', 'error');
        }
    };

    // Tab content renderers
    const renderDashboardTab = () => (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
                Filo Genel Bakış
            </Typography>

            {statsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {(hasRole('ROLE_ADMIN') || hasRole('ROLE_EMPLOYEE')) && (
                        <>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <StatCard
                                    title="Toplam Araç"
                                    value={stats.totalVehicles}
                                    icon={<CarIcon fontSize="large" />}
                                    color={theme.palette.primary.main}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <StatCard
                                    title="Kiradaki Araçlar"
                                    value={stats.vehiclesInRental}
                                    icon={<RentalIcon fontSize="large" />}
                                    color={theme.palette.success.main}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <StatCard
                                    title="Bakımdaki Araçlar"
                                    value={stats.vehiclesInMaintenance}
                                    icon={<MaintenanceIcon fontSize="large" />}
                                    color={theme.palette.warning.main}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <StatCard
                                    title="Satıştaki Araçlar"
                                    value={stats.vehiclesForSale}
                                    icon={<SellIcon fontSize="large" />}
                                    color={theme.palette.info.main}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <StatCard
                                    title="Satılan Araçlar"
                                    value={stats.vehiclesSold}
                                    icon={<CheckCircleIcon fontSize="large" />}
                                    color={theme.palette.success.dark}
                                />
                            </Grid>
                        </>
                    )}
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <StatCard
                            title="Müsait Araçlar"
                            value={stats.availableVehicles}
                            icon={<CheckCircleIcon fontSize="large" />}
                            color={theme.palette.success.main}
                        />
                    </Grid>
                </Grid>
            )}

            {(hasRole('ROLE_ADMIN') || hasRole('ROLE_EMPLOYEE')) && (
                <Box sx={{ mt: 4 }}>
                    <UpcomingMaintenances />
                </Box>
            )}
        </Box>
    );

    const renderVehiclesTab = () => (
        <Box sx={{ p: 3 }}>
            <VehicleList
                vehicles={vehicles}
                loading={loading}
                error={error}
                showForm={showForm}
                setShowForm={setShowForm}
                onAddVehicle={handleAddVehicle}
                hasRole={hasRole}
                fetchVehicles={fetchVehicles}
            />
        </Box>
    );

    const renderForSaleTab = () => (
        <Box sx={{ p: 3 }}>
            <ForSaleVehicles />
        </Box>
    );

    const renderUsersTab = () => (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
                Kullanıcı Yönetimi
            </Typography>

            <Card sx={{ mb: 4, boxShadow: theme.shadows[3] }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Kullanıcı ara..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <IconButton onClick={clearSearch} size="small">
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                )
                            }}
                            sx={{ maxWidth: 500 }}
                        />
                        <Select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            sx={{ minWidth: 150 }}
                        >
                            <MenuItem value="all">Tüm Roller</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="employee">Çalışan</MenuItem>
                            <MenuItem value="customer">Müşteri</MenuItem>
                        </Select>
                    </Box>
                </CardContent>
            </Card>

            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: theme.palette.primary.light }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Kullanıcı</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Rol</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>İşlem</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <Avatar sx={{
                                                mr: 2,
                                                bgcolor: theme.palette.primary.main,
                                                width: 40,
                                                height: 40
                                            }}>
                                                {user.username.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography fontWeight="medium">{user.username}</Typography>
                                                <Typography variant="body2" color="textSecondary">ID: {user.id}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            {getRoleIcon(user.roles[0])}
                                            <Typography sx={{ ml: 1, textTransform: 'capitalize' }}>
                                                {getRoleDisplayName(user.roles[0])}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={getRoleDisplayName(user.roles[0])}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            sx={{ minWidth: 150 }}
                                            disabled={user.username === 'admin'}
                                        >
                                            <MenuItem value="admin">
                                                <Box display="flex" alignItems="center">
                                                    <AdminIcon sx={{ mr: 1, color: 'error.main' }} />
                                                    Admin
                                                </Box>
                                            </MenuItem>
                                            <MenuItem value="employee">
                                                <Box display="flex" alignItems="center">
                                                    <EmployeeIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                    Çalışan
                                                </Box>
                                            </MenuItem>
                                            <MenuItem value="customer">
                                                <Box display="flex" alignItems="center">
                                                    <UserIcon sx={{ mr: 1, color: 'action.active' }} />
                                                    Müşteri
                                                </Box>
                                            </MenuItem>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <SearchIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
                                        <Typography variant="h6" color="textSecondary">
                                            {searchTerm ? 'Sonuç bulunamadı' : 'Kullanıcı listesi boş'}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                            {searchTerm ? 'Arama kriterlerinizi gözden geçirin' : 'Henüz kullanıcı eklenmemiş'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard': return renderDashboardTab();
            case 'vehicles': return renderVehiclesTab();
            case 'forSale': return renderForSaleTab();
            case 'users': return renderUsersTab();
            default: return null;
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        bgcolor: theme.palette.background.paper,
                        borderRight: 'none',
                        boxShadow: theme.shadows[3]
                    },
                }}
            >
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" component="div" sx={{
                        fontWeight: 700,
                        color: theme.palette.primary.main
                    }}>
                        Filo Yönetimi
                    </Typography>
                    {user && (
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                            {user.username}
                        </Typography>
                    )}
                </Box>
                <Divider />
                <List>
                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activeTab === 'dashboard'}
                            onClick={() => setActiveTab('dashboard')}
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: theme.palette.action.selected,
                                    '&:hover': {
                                        bgcolor: theme.palette.action.selected
                                    }
                                }
                            }}
                        >
                            <ListItemIcon>
                                <HomeIcon color={activeTab === 'dashboard' ? 'primary' : 'inherit'} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Genel Bakış"
                                primaryTypographyProps={{
                                    fontWeight: activeTab === 'dashboard' ? 600 : 'normal'
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton
                            selected={activeTab === 'vehicles'}
                            onClick={() => setActiveTab('vehicles')}
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: theme.palette.action.selected,
                                    '&:hover': {
                                        bgcolor: theme.palette.action.selected
                                    }
                                }
                            }}
                        >
                            <ListItemIcon>
                                <CarIcon color={activeTab === 'vehicles' ? 'primary' : 'inherit'} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Araçlar"
                                primaryTypographyProps={{
                                    fontWeight: activeTab === 'vehicles' ? 600 : 'normal'
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                    {(hasRole('ROLE_ADMIN') || hasRole('ROLE_EMPLOYEE')) && (
                        <ListItem disablePadding>
                            <ListItemButton
                                selected={activeTab === 'forSale'}
                                onClick={() => setActiveTab('forSale')}
                                sx={{
                                    '&.Mui-selected': {
                                        bgcolor: theme.palette.action.selected,
                                        '&:hover': {
                                            bgcolor: theme.palette.action.selected
                                        }
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    <SellIcon color={activeTab === 'forSale' ? 'primary' : 'inherit'} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Satışa Uygun Araçlar"
                                    primaryTypographyProps={{
                                        fontWeight: activeTab === 'forSale' ? 600 : 'normal'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    )}
                    {hasRole('ROLE_ADMIN') && (
                        <ListItem disablePadding>
                            <ListItemButton
                                selected={activeTab === 'users'}
                                onClick={() => setActiveTab('users')}
                                sx={{
                                    '&.Mui-selected': {
                                        bgcolor: theme.palette.action.selected,
                                        '&:hover': {
                                            bgcolor: theme.palette.action.selected
                                        }
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    <UsersIcon color={activeTab === 'users' ? 'primary' : 'inherit'} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Kullanıcılar"
                                    primaryTypographyProps={{
                                        fontWeight: activeTab === 'users' ? 600 : 'normal'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    )}
                </List>
                <Divider />
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={logout}>
                            <ListItemIcon>
                                <LogoutIcon />
                            </ListItemIcon>
                            <ListItemText primary="Çıkış Yap" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
                    bgcolor: theme.palette.background.default
                }}
            >
                {renderTabContent()}
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={SNACKBAR_AUTO_HIDE_DURATION}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                    elevation={6}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

const StatCard = ({ title, value, icon, color }) => {
    return (
        <Card sx={{
            height: '100%',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
            }
        }}>
            <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                            {value}
                        </Typography>
                    </Box>
                    <Box sx={{
                        color,
                        p: 1.5,
                        bgcolor: `${color}20`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {React.cloneElement(icon, { fontSize: 'large' })}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default HomePage;