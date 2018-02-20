const Issuer = require('openid-client').Issuer;
const util = require('util');
const uuid = require('uuid');
// const base64url = require('base64url');
// const crypto = require('crypto');
// const request = require('request');
const request = require('superagent');

describe('Client', function() {

    it('should successfully get issuer from the discovery document', async function() {

        var issuer = await Issuer.discover('http://localhost:3000');

        const client = new issuer.Client({
            client_id: 'myapp',
        });

        var url = client.authorizationUrl({
            redirect_uri: 'http://localhost/redirect',
            scope: 'openid',
            nonce: uuid(),
            state: uuid(),
            code_challenge: uuid()
        });
        console.log(url);

        try {
            var res = await request.agent().get(url);
        } catch(err) {
            console.error(err.message);
            console.error(err.stack);
        }

        console.log(res.text);
    });

});