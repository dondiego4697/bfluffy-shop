import {Request} from 'express';
import _CSRF from 'csrf';

const csrf = new _CSRF();
const secret = csrf.secretSync();

export const CSRF = {
    generateToken() {
        return csrf.create(secret);
    },
    isTokenValid(req: Request) {
        const token = req.query.csrf || (req.body && req.body.csrf);

        if (!token) {
            return false;
        }

        return csrf.verify(secret, token);
    }
};
