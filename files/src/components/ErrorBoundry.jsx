import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

/**
 * Error Boundary - مكون يمسك الأخطاء والاستثناءات
 * 
 * مثال الاستخدام:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // يمكنك إرسال الخطأ إلى خدمة تتبع الأخطاء هنا
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-2">
              حدث خطأ
            </h1>

            <p className="text-gray-300 text-center mb-4">
              عذراً، حدث خطأ غير متوقع. حاول مرة أخرى.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-900 text-red-200 p-3 rounded mb-4 text-sm font-mono overflow-auto max-h-40">
                <p className="font-bold mb-2">تفاصيل الخطأ:</p>
                <p>{this.state.error?.message}</p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" />
              حاول مرة أخرى
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary