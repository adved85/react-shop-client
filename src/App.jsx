import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Shop from './components/Shop';
import Product from './components/Product';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Login from './components/admin/Login';
import AdminLayout from './components/admin/AdminLayout';

import DashboardContent from './components/admin/dashboard/DashboardContent';
import DepartmentsContent from './components/admin/departments/DepartmentsContent';
import DepartmentCreate from './components/admin/departments/DepartmentCreate';
import DepartmentShow from './components/admin/departments/DepartmentShow';
import DepartmentEdit from './components/admin/departments/DepartmentEdit';

import { RequireAdmin } from './components/context/RequireAdmin';
import { AdminContextProvider } from './components/context/AdminContextProvider';

function App() {
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

            <Route path="/admin" element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            } >
              <Route index element={<DashboardContent />} />
              <Route path="dashboard" element={<DashboardContent />} />
              <Route path="departments" element={<DepartmentsContent />} />
              <Route path="departments/create" element={<DepartmentCreate />} />
              <Route path="departments/:id" element={<DepartmentShow />} />
              <Route path="departments/:id/edit" element={<DepartmentEdit />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </AdminContextProvider>
    </>
  )
}

export default App
