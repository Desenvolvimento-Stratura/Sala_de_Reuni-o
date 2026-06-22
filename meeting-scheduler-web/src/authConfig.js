export const msalConfig = {
    auth: {
        clientId: "1d73f895-434d-4d16-a462-952b62edb590",
        authority: "https://login.microsoftonline.com/c23f70f0-b91c-4c26-aa97-573bc73a5510",
        redirectUri: "http://localhost:5173",
        navigateToLoginRequestUrl: false
    },
     cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true
    }
};


export const loginRequest = {
    scopes: ["openid", "profile", "User.Read"]
};