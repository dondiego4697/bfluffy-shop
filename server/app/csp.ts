import {ContentSecurityPolicyOptions} from 'helmet/dist/middlewares/content-security-policy';

export const directives: ContentSecurityPolicyOptions['directives'] = {
    defaultSrc: ["'none'"],
    scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'", 'telegram.org'],
    styleSrc: ["'self'", "'unsafe-inline'"],
    fontSrc: ["'self'", 'data:'],
    imgSrc: ["'self'", 'data:'],
    frameSrc: ["'self'", 'oauth.telegram.org'],
    childSrc: ["'self'"],
    connectSrc: ["'self'"]
};
