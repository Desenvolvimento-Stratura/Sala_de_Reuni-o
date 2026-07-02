import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import SalaDeReuniao from "./SalaDeReuniao";

function App() {
  const { instance, accounts } = useMsal();

  useEffect(() => {
    const activeAccount = instance.getActiveAccount();
    if (activeAccount) {
      console.log("Conta ativa:", activeAccount);
    }
  }, [instance]);

  const login = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Erro Login:", error);
    }
  };

  const logout = async () => {
    try {
      await instance.logoutPopup();
    } catch (error) {
      console.error("Erro Logout:", error);
    }
  };

  if (accounts.length === 0) {
    return (
      <div style={{
        background: '#3c3c3e',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: 'Manrope, sans-serif',
        color: '#f4f2ed'
      }}>
        <h1 style={{
          fontFamily: 'Big Shoulders Display, sans-serif',
          fontSize: '32px',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          Sala de <span style={{ color: '#f2a93b' }}>Reunião</span>
        </h1>
        <p style={{ color: '#9aa0ad', fontSize: '14px', margin: 0 }}>
          Entre com sua conta da Stratura para continuar
        </p>
        <button onClick={login} style={{
          background: '#f2a93b',
          color: '#1a1305',
          border: 'none',
          padding: '12px 28px',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: '700',
          cursor: 'pointer',
          fontFamily: 'Manrope, sans-serif',
          transition: 'filter .15s'
        }}>
          Entrar com conta Microsoft
        </button>
      </div>
    );
  }

  console.log("Usuario logado:", accounts[0]);

  return (
    <div>
      <SalaDeReuniao user={accounts[0]} onLogout={logout} />
    </div>
  );
}

export default App;