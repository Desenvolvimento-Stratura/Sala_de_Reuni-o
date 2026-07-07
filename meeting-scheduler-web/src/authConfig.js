export const msalConfig = {
    auth: {
        clientId: "2808ead7-9a3d-41ad-ac61-bbcd35fe595b",
        authority: "https://login.microsoftonline.com/c23f70f0-b91c-4c26-aa97-573bc73a5510",
        redirectUri: import.meta.env.VITE_REDIRECT_URI || "https://sala-reuniao-web.onrender.com",
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true
    }
};
export const loginRequest = {
    scopes: ["openid", "profile", "User.Read"]
};

// Escopo da própria API (mesmo app registration do SPA).
// Requer que em "Expor uma API" do app no Azure AD exista o escopo access_as_user.
export const apiRequest = {
    scopes: ["api://2808ead7-9a3d-41ad-ac61-bbcd35fe595b/access_as_user"]
};