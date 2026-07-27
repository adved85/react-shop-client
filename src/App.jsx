import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Shop from './components/Shop';
import Product from './components/Product';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Login from './components/admin/Login';
import Dashboard from './components/admin/Dashboard';

import { RequireAdmin } from './components/context/RequireAdmin';
import { AdminContextProvider } from './components/context/AdminContext';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <AdminContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />

            <Route path="admin/login" element={<Login />} />

            <Route path="admin/dashboard" element={
              <RequireAdmin>
                <Dashboard />
              </RequireAdmin>
            } />

          </Routes>
        </BrowserRouter>
      </AdminContextProvider>
    </>
  )
}

export default App
