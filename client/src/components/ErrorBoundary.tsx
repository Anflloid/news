// Error Boundary можливий лише як класовий компонент
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  state: State = { hasError: false };

  // eslint-disable-next-line class-methods-use-this
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Помилка в інтерфейсі:', error, info.componentStack);
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
          <h1>Щось пішло не так 😕</h1>
          <p className="muted">Спробуйте оновити сторінку.</p>
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            Оновити сторінку
          </button>
        </div>
      );
    }
    return children;
  }
}
