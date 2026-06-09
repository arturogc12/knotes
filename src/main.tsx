import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./App.tsx";
import { PatientAppLayout } from "./components/patient/PatientAppLayout.tsx";
import { AuthCallbackHandler } from "./components/auth/AuthCallbackHandler.tsx";
import { LoggedInAppRedirect } from "./components/auth/LoggedInAppRedirect.tsx";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import Home from "./pages/Home.tsx";
import Professionals from "./pages/Professionals.tsx";
import Login from "./pages/Login.tsx";
import Chat from "./pages/Chat.tsx";
import PwaWelcome from "./pages/PwaWelcome.tsx";
import { PwaWelcomeRedirect } from "./components/pwa/PwaWelcomeRedirect.tsx";
import Nudos from "./pages/Nudos.tsx";
import NudoDetail from "./pages/NudoDetail.tsx";
import Settings from "./pages/Settings.tsx";
import "./i18n/index.ts";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <AuthCallbackHandler />
        <LoggedInAppRedirect />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profesionales" element={<Professionals />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/bienvenida" element={<PwaWelcome />} />
            <Route element={<PatientAppLayout />}>
              <Route
                path="/chat"
                element={
                  <PwaWelcomeRedirect>
                    <Chat />
                  </PwaWelcomeRedirect>
                }
              />
              <Route path="/nudos" element={<Nudos />} />
              <Route path="/nudos/:id" element={<NudoDetail />} />
              <Route path="/ajustes" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
