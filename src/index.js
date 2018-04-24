const express = require('express');
const Provider = require('oidc-provider');
const morgan = require('morgan');
const logger = require('./logger');
const users = require('./users');
const MongoAdapter = require('./adapters/MongoAdapter');
const nunjucks = require('nunjucks');
const querystring = require('querystring');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const fs = require('fs');
const rewrite = require('express-urlrewrite');

const ROOT_URL = '/connect';


// const configuration = { features: { pkce: { forcedForNative: true } } };
process.on('unhandledRejection', error => {
    logger.error(error);
});

const app = express();
app.proxy = true;

nunjucks.configure(path.join(__dirname, 'views'), {
    autoescape: true,
    express: app
});

app.get('/', function(req, res){
    res.send('<DOCTYPE html><html><body>Hello World!</body></html>');
});

const prefix = '/connect';
app.use(rewrite('/.well-known/*', `${prefix}/.well-known/$1`));

const oidc = new Provider('http://192.168.1.114:8080', {
    claims: {
        email: ['email', 'email_verified'],
        phone: ['phone_number', 'phone_number_verified'],
        profile: ['family_name', 'given_name', 'locale', 'profile']
    },
    findById: users.findById,
    features: {
        devInteractions: false, // defaults to true
        // discovery: true, // defaults to true
        // requestUri: true, // defaults to true
        // oauthNativeApps: true, // defaults to true
        // pkce: true, // defaults to true
    
        //backchannelLogout: true, // defaults to false
        //claimsParameter: true, // defaults to false
        //encryption: true, // defaults to false
        //frontchannelLogout: true, // defaults to false
        //introspection: true, // defaults to false
        //registration: true, // defaults to false
        //request: true, // defaults to false
        //revocation: true, // defaults to false
        //sessionManagement: true, // defaults to false
    },
    routes: {
        authorization: '/auth',
        certificates: '/certs',
        check_session: '/session/check',
        end_session: '/session/end',
        introspection: '/token/introspection',
        registration: '/reg',
        revocation: '/token/revocation',
        token: '/token',
        userinfo: '/me'
    }
});

oidc.initialize({ adapter: MongoAdapter })
    .then(function() {

        app.use(morgan('dev'));
        app.use(ROOT_URL, oidc.callback);
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));

        app.get('/', function(req, res){
            res.send('<h1>Hello world!</h1>');
        });

        app.get('/interaction/:grant', async (req, res, next) => {
            try{
                // get the oidc session
                const details = await oidc.interactionDetails(req);
                // get the authorized client that requested the interaction
                const client = await oidc.Client.find(details.params.client_id);

                if (details.interaction.error === 'login_required') {
                    res.render('signin.html', {
                        client,
                        details,
                        title: 'Sign-in',
                        debug: querystring.stringify(details.params, ',<br/>', ' = ', {
                            encodeURIComponent: value => value,
                        }),
                        interaction: querystring.stringify(details.interaction, ',<br/>', ' = ', {
                            encodeURIComponent: value => value,
                        }),
                    });
                }
                else
                {
                    res.render('authorize.html', {
                        client,
                        details,
                        title: 'Authorize',
                        debug: querystring.stringify(details.params, ',<br/>', ' = ', {
                            encodeURIComponent: value => value,
                        }),
                        interaction: querystring.stringify(details.interaction, ',<br/>', ' = ', {
                            encodeURIComponent: value => value,
                        })
                    });
                }
            }catch(err){
                next(err);
            }
        });

        // This won't work with dev interactions.
        app.post('/interaction/:grant/login', async (req, res, next) => {
            //TODO: query  mongodb here
            var account = await users.findByEmail(req.body.login);

            if(!account) {
                // get the oidc session
                const details = await oidc.interactionDetails(req);
                // get the authorized client that requested the interaction
                const client = await oidc.Client.find(details.params.client_id);
                res.render('signin.html', {
                    client,
                    details,
                    title: 'Sign-in',
                    errorMessage: 'Invalid email or password.',
                    debug: querystring.stringify(details.params, ',<br/>', ' = ', {
                        encodeURIComponent: value => value,
                    }),
                    interaction: querystring.stringify(details.interaction, ',<br/>', ' = ', {
                        encodeURIComponent: value => value,
                    }),
                });
                return;
            }

            const result = {
                login: {
                    account: account.id,
                    acr: 'urn:mace:incommon:iap:bronze',
                    amr: ['pwd'],
                    remember: !!req.body.remember,
                    ts: Math.floor(Date.now() / 1000),
                },
                consent: {},
            };
            //res.send(result);
            await oidc.interactionFinished(req, res, result);
            await next();
        });

        app.get('/redirect', function(req, res) {
            logger.info('redirected to native client');
        });

        app.post('/interaction/:grant/confirm', async (req, res, next) => {
            const result = { consent: {} };
            await oidc.interactionFinished(req, res, result);
            await next();
        });

        // var options = {
        //     pfx: fs.readFileSync(path.join(__dirname, 'dev-tls.pfx')),
        //     passphrase: 'N9L7ePSNMSCZyqm3TryRpUkj'
        // };

        //https.createServer(options, app).listen(8081);
        http.createServer(app).listen(8080);
    })
    .catch(function(err) {
        logger.error(err);
    });
