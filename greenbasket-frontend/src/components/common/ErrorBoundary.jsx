import { Component } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, RefreshCw, Home, ShoppingBag } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-surface-50 p-8">
          <div className="mx-auto max-w-md text-center animate-fade-in">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 shadow-lg shadow-red-200/50">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 mb-2">
              Something Went Wrong
            </h1>
            <p className="text-surface-500 mb-2 leading-relaxed">
              We encountered an unexpected error while rendering this page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 overflow-auto rounded-lg bg-red-50 border border-red-200 p-4 text-left">
                <p className="text-xs font-mono text-red-700 break-all">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="mt-2 text-xs font-mono text-red-600 whitespace-pre-wrap">
                    {this.state.error.stack.split('\n').slice(0, 6).join('\n')}
                  </pre>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <button
                onClick={this.handleRetry}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <Link
                to="/"
                onClick={this.handleRetry}
                className="btn-secondary inline-flex items-center gap-2 px-6 py-3"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
              <Link
                to="/products"
                onClick={this.handleRetry}
                className="btn-ghost inline-flex items-center gap-2 px-6 py-3"
              >
                <ShoppingBag className="h-4 w-4" />
                Browse Products
              </Link>
            </div>
            <p className="mt-8 text-sm text-surface-400">
              If this issue persists, please contact our support team.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
