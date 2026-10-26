import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import FileManagerPage from './pages/FileManagerPage';
import PrivacyPage from "./pages/PrivacyPage.tsx";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            // Lỗi 4xx (sai quyền, không tìm thấy...) thì không thử lại
            retry: (count, err) => {
                const status = (err as AxiosError).response?.status;
                if (status && status >= 400 && status < 500) return false;
                return count < 2;
            },
        },
    },
});

export default function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ToastProvider>
                    <AuthProvider>
                        <BrowserRouter>
                            <Routes>
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/privacy" element={<PrivacyPage />} />
                                <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
                                <Route element={<ProtectedRoute />}>
                                    <Route element={<AppLayout />}>
                                        <Route path="/" element={<FileManagerPage />} />
                                    </Route>
                                </Route>
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </BrowserRouter>
                    </AuthProvider>
                </ToastProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}