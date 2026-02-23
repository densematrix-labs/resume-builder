import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

const HomePage = lazy(() => import('./pages/HomePage'))
const BuilderPage = lazy(() => import('./pages/BuilderPage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="builder" element={<BuilderPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="payment/success" element={<PaymentSuccessPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
