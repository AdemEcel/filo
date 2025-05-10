import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import {
    TextField, Button, Container, Typography, Box, Alert,
    Paper, Avatar, CssBaseline, Grid, Divider, CircularProgress
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginTop: theme.spacing(8),
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: '16px',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    width: theme.spacing(7),
    height: theme.spacing(7),
}));

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const result = await login(formData.username, formData.password);

        if (!result.success) {
            let errorMessage = 'Kullanıcı adı veya şifre hatalı';

            if (result.status === 401) {
                errorMessage = 'Geçersiz kullanıcı adı veya şifre';
            } else if (result.status === 403) {
                errorMessage = 'Hesabınız aktif değil';
            } else if (result.error) {
                errorMessage = result.error;
            }

            setError(errorMessage);
        }

        setIsSubmitting(false);
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <StyledPaper elevation={6}>
                <StyledAvatar>
                    <LockOutlined fontSize="large" />
                </StyledAvatar>
                <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', mt: 2 }}>
                    Filo Araç Kiralama
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Lütfen hesabınıza giriş yapın
                </Typography>

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            width: '100%',
                            mb: 2,
                            display: 'flex', // İçerik yatayda ortalanacak
                            alignItems: 'center'
                        }}
                        onClose={() => setError('')} // Kapatma butonu ekleyin
                    >
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Kullanıcı Adı"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Şifre"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isSubmitting}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isSubmitting}
                        size="large"
                        sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: '8px' }}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Giriş Yap'}
                    </Button>

                    <Divider sx={{ my: 2 }}>veya</Divider>

                    <Grid container justifyContent="center" spacing={2}>
                        <Grid item>
                            <Button
                                variant="outlined"
                                color="primary"
                                component={Link}
                                to="/register"
                                sx={{ borderRadius: '8px' }}
                            >
                                Yeni Hesap Oluştur
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </StyledPaper>

            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 4 }}>
                © {new Date().getFullYear()} Filo Araç Kiralama - Tüm hakları saklıdır.
            </Typography>
        </Container>
    );
};

export default LoginPage;