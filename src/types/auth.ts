export type AuthType = 'none' | 'basic' | 'bearer' | 'apiKey'

export interface AuthConfig {
    type: AuthType;
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
    headerKey?: string;
    inHeader: boolean;
}

export interface ApiRequest {
    apiUrl: string;
    walletAddress: string;
    verificationExpression: string;
    auth: AuthConfig;
} 