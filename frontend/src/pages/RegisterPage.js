import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import {
    TextField, Button, Container, Typography, Box, Alert,
    CircularProgress, Paper, Avatar, CssBaseline, Grid,
    Divider, InputAdornment, IconButton, Link
} from '@mui/material';
import {
    LockOutlined, Visibility, VisibilityOff,
    PersonOutline, EmailOutlined
} from '@mui/icons-material';
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

const PasswordStrengthIndicator = ({ password }) => {
    const getStrength = () => {
        if (!password) return 0;
        let strength = 0;

        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        return Math.min(strength, 5);
    };

    const strength = getStrength();
    const strengthText = ['Çok zayıf', 'Zayıf', 'Orta', 'Güçlü', 'Çok güçlü', 'Mükemmel'][strength];
    const strengthColor = ['error', 'error', 'warning', 'success', 'success', 'success'][strength];

    return (
        <Box sx={{ width: '100%', mt: 1 }}>
            <Typography variant="caption" color="textSecondary">
                Şifre gücü: <Typography component="span" color={strengthColor} variant="caption">
                {strengthText}
            </Typography>
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                {[...Array(5)].map((_, i) => (
                    <Box
                        key={i}
                        sx={{
                            height: 4,
                            flex: 1,
                            backgroundColor: i < strength ? `${strengthColor}.main` : 'divider',
                            borderRadius: 2
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
};

const RegisterPage = () => {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [validationErrors, setValidationErrors] = useState({});

    const validateForm = () => {
        const errors = {};

        if (!formData.username.trim()) {
            errors.username = 'Kullanıcı adı gereklidir';
        } else if (formData.username.length < 3) {
            errors.username = 'En az 3 karakter olmalıdır';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email gereklidir';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Geçerli bir email adresi girin';
        }

        if (!formData.password) {
            errors.password = 'Şifre gereklidir';
        } else if (formData.password.length < 8) {
            errors.password = 'En az 8 karakter olmalıdır';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Şifreler eşleşmiyor';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);
        try {
            const { success, error } = await register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            if (success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(error || 'Kayıt işlemi başarısız');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSuccess(false);
    };

    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    return (
        <Container component="main" maxWidth="sm">
            <CssBaseline />
            <StyledPaper elevation={6}>
                <StyledAvatar>
                    <LockOutlined fontSize="large" />
                </StyledAvatar>
                <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', mt: 2 }}>
                    Yeni Hesap Oluştur
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Filo Araç Kiralama'ya hoş geldiniz
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {!success ? (
                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            fullWidth
                            label="Kullanıcı Adı"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            margin="normal"
                            error={!!validationErrors.username}
                            helperText={validationErrors.username}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonOutline color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Email Adresi"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            margin="normal"
                            error={!!validationErrors.email}
                            helperText={validationErrors.email}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailOutlined color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Şifre"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            margin="normal"
                            error={!!validationErrors.password}
                            helperText={validationErrors.password}
                            sx={{ mb: 1 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={toggleShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <PasswordStrengthIndicator password={formData.password} />

                        <TextField
                            fullWidth
                            label="Şifre Tekrar"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            margin="normal"
                            error={!!validationErrors.confirmPassword}
                            helperText={validationErrors.confirmPassword}
                            sx={{ mt: 2, mb: 3 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={toggleShowConfirmPassword}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            size="large"
                            sx={{ py: 1.5, borderRadius: '8px', mb: 2 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Kayıt Ol'}
                        </Button>

                        <Divider sx={{ my: 2 }}>veya</Divider>

                        <Grid container justifyContent="center">
                            <Grid item>
                                <Typography variant="body2">
                                    Zaten hesabınız var mı?{' '}
                                    <Link
                                        href="#"
                                        onClick={() => navigate('/login')}
                                        color="primary"
                                        underline="hover"
                                    >
                                        Giriş yapın
                                    </Link>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                ) : (
                    <Box textAlign="center" sx={{ width: '100%' }}>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Kayıt işlemi başarıyla tamamlandı!
                        </Alert>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Giriş sayfasına yönlendiriliyorsunuz...
                        </Typography>
                        <CircularProgress />
                    </Box>
                )}
            </StyledPaper>
        </Container>
    );
};

export default RegisterPage;