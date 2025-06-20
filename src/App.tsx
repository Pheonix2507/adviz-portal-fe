import { Routes, Route } from "react-router-dom";
// import { Suspense } from "react";
import { UserRole } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDash";
import EmployeeDashboard from "@/pages/EmployeeDash";
import AddBranch from "@/pages/AdBranch";
import AddFirm from "@/pages/AdFirm";
import AddEmployee from "@/pages/AdEmp";
import SignUpPage from "@/pages/Clientsignup";
import Client from "@/pages/AdminClient";
import CaseForm from "@/pages/Case";
import Allcases from "@/pages/AlCase";
import AllCaseE from "@/pages/AlCaseE"
import CaseDetails from "@/components/CaseDetailsAdmin"
// import CaseDetailsEmployee from "@/components/CaseDetailsEmployee"
import CaseDetailsC from "@/components/CaseDetailsClient"
import ClientCases from "@/pages/ClientCases"
import Profile from "@/pages/MyProfile"
import Payment from "@/components/payment"
import VerifyPayments from "@/components/VerifyPayments"
import ClientDetails from "./components/ClientDetails";
import AlCaseA from "@/pages/AlCaseA"
import EmployeeDetails from "@/components/EmployeeDetails"
import ClientTransactions from "@/components/ClientTransactions"
// import { Loader } from "lucide-react";
export default function App() {
  return (

    <Routes>

      {/* General Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/unauthorized" element={<div className="p-4 text-center">Unauthorized</div>} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Super Admin Routes */}

      <Route path="/superadmin" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/superadmin/Profile" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/superadmin/AddBranch" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <AddBranch />
        </ProtectedRoute>
      } />

      <Route path="/superadmin/AddFirm" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <AddFirm />
        </ProtectedRoute>
      } />

      <Route path="/superadmin/AddEmployee" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <AddEmployee />
        </ProtectedRoute>
      } />
      <Route path="/superadmin/clients" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <Client />
        </ProtectedRoute>
      } />

      <Route path="/superadmin/cases/all" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <Allcases />
        </ProtectedRoute>
      } />
      <Route path="/superadmin/cases/:CaseNo" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <CaseDetails />
        </ProtectedRoute>
      } />

      <Route path="/superadmin/VerifyPayments" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <VerifyPayments />
        </ProtectedRoute>
      } />
      <Route path="/superadmin/cases/new" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <CaseForm />
        </ProtectedRoute>
      } />

      <Route path="/superadmin/cases/mycases" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <AlCaseA/>
        </ProtectedRoute>
      } />
      <Route path="/superadmin/clients/clientDetails" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <ClientDetails />
        </ProtectedRoute>
      } />

      <Route path="/superadmin/employee/employeeDetails" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <EmployeeDetails />
        </ProtectedRoute>
      } />


      {/* Super Admin Routes */}

      <Route path="/client/cases" element={
        <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
          <ClientCases/>
        </ProtectedRoute>
      } />

            <Route path="/client/cases/:CaseNo" element={
        <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
          <CaseDetailsC />
        </ProtectedRoute>
      } />

      <Route path="/client/Profile" element={
        <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
          <Profile />
        </ProtectedRoute>
      } />

      <Route path="/client/payment" element={
        <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
          <Payment/>
        </ProtectedRoute>
      } />

      <Route path="/client/Transactions" element={
        <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
          <ClientTransactions/>
        </ProtectedRoute>
      } />


      {/* Super Admin Routes */}
      <Route path="/employee" element={
        <ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]}>
          <EmployeeDashboard />
        </ProtectedRoute>
      } />

      <Route path="/employee/cases/new" element={
        <ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]}>
          <CaseForm />
        </ProtectedRoute>
      } />

      <Route path="/employee/cases" element={
        <ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]}>
          < AllCaseE />
        </ProtectedRoute>
      } />

      <Route path="/employee/cases/:CaseNo" element={
        <ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]}>
          <CaseDetails/>
        </ProtectedRoute>
      } />
    
    <Route path="/employee/Profile" element={
        <ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]}>
          <Profile />
        </ProtectedRoute>
      } />

    </Routes>
  );
}
