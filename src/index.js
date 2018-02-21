const express = require('express');
const Provider = require('oidc-provider');
const morgan = require('morgan');
const logger = require('./logger');
// const clients = require('./clients');
const users = require('./users');
const MongoAdapter = require('./adapters/MongoAdapter');

const ROOT_URL = '/';


//const configuration = { features: { pkce: { forcedForNative: true } } };
process.on('unhandledRejection', error => {
    logger.error(error);
});

const app = express();

const oidc = new Provider('http://localhost', {
    claims: {
        email: ['email', 'email_verified'],
        phone: ['phone_number', 'phone_number_verified'],
        profile: ['family_name', 'given_name', 'locale', 'profile']
    },
    findById: users.findById
});

oidc.initialize({ adapter: MongoAdapter })
    .then(function() {
        app.use(morgan('dev'));
        app.use(ROOT_URL, oidc.callback);
        app.listen(80);
    })
    .catch(function(err) {
        logger.error(err);
    });
