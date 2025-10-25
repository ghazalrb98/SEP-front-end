import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./login";
import { Dashboard } from "./Dashboard";
import { RequestsList } from "./RequestsList";
import { CreateRequest } from "./CreateRequest";
import { RequestDetail } from "./RequestDetaill";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="requests" replace />} />
          <Route path="requests" element={<RequestsList />} />
          <Route path="requests/new" element={<CreateRequest />} />
          <Route path="requests/:id" element={<RequestDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
