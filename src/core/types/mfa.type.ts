export interface IMfaSetupResponse {
    qrCode: string;
    secret: string;
}

export interface IMfaVerifyPayload {
    token: string;
    secret: string;
}

export interface IMfaVerifyLoginPayload {
    email: string;
    token: string;
}
