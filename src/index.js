const process = require('process');
const express = require('express');
const Provider = require('oidc-provider');
const morgan = require('morgan');
const clients = require('./clients');
const users = require('./users');

const MYAPP_API_SCOPE = 'myapp-api'
const ROOT_URL = '/';

// process.on('unhandledRejection', error => {
//     console.log('unhandledRejection', error.message);
// });

const app = express();

const oidc = new Provider('http://localhost:3000', {
    claims: {
        email: ['email', 'email_verified'],
        phone: ['phone_number', 'phone_number_verified'],
        profile: ['family_name', 'given_name', 'locale', 'profile']
    },
    scopes: [MYAPP_API_SCOPE],
    findById: users.findById
});
oidc.initialize({clients}).then(function () {
    app.use(morgan('dev'));
    app.use(ROOT_URL, oidc.callback);
    app.listen(3000);
});