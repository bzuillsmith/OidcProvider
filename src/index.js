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

const ROOT_URL = '/connect';


//const configuration = { features: { pkce: { forcedForNative: true } } };
process.on('unhandledRejection', error => {
    logger.error(error);
});

const app = express();

nunjucks.configure(path.join(__dirname, 'views'), {
    autoescape: true,
    express: app
});

const oidc = new Provider('http://localhost', {
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
    }
});

oidc.initialize({ adapter: MongoAdapter })
    .then(function() {

        app.use(morgan('dev'));
        app.use(ROOT_URL, oidc.callback);
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));

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
                //TODO: handle invalid login
                return res.send('invalid login');
            }

            const result = {
                login: {
                    account: account.accountId,
                    acr: 'urn:mace:incommon:iap:bronze',
                    amr: ['pwd'],
                    remember: !!req.body.remember,
                    ts: Math.floor(Date.now() / 1000),
                },
                consent: {},
            };
            res.send(result);
            //await oidc.interactionFinished(req, res, result);
            //await next();
        });

        app.listen(80);
    })
    .catch(function(err) {
        logger.error(err);
    });
