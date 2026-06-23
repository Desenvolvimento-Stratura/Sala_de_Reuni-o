export const msalConfig = {
    auth: {
        clientId: "2808ead7-9a3d-41ad-ac61-bbcd35fe595b",
        authority: "https://login.microsoftonline.com/c23f70f0-b91c-4c26-aa97-573bc73a5510",
        redirectUri: "https://localhost:5173",
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true
    }
};
export const loginRequest = {
    scopes: ["openid", "profile", "User.Read"]
};