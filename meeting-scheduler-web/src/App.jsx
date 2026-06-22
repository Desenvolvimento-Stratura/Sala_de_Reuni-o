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
            console.log("Iniciando login...");
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
            <div>
                <h1>Meeting Scheduler</h1>

                <button onClick={login}>
                    Entrar com Microsoft
                </button>
            </div>
        );
    }

    return (
        <div>
            <button onClick={logout}>
                Sair
            </button>

            <SalaDeReuniao />
        </div>
    );
}

export default App;