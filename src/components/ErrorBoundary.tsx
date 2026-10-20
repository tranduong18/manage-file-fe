import { Component, type ReactNode } from 'react';

interface State { hasError: boolean }

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: unknown) {
        console.error(error);
    }

    render() {
        if (!this.state.hasError) return this.props.children;
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-3">
                    <p className="text-lg font-medium">Đã có lỗi không mong muốn.</p>
                    <button
                        onClick={() => window.location.assign('/')}
                        className="px-3 py-1.5 rounded bg-blue-600 text-white"
                    >
                        Tải lại trang
                    </button>
                </div>
            </div>
        );
    }
}