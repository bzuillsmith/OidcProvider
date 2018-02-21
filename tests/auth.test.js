/* global describe it */
const Issuer = require('openid-client').Issuer;
const assert = require('assert');
const uuid = require('uuid');
// const base64url = require('base64url');
// const crypto = require('crypto');
// const request = require('request');
const request = require('superagent');

describe('Client', function() {

    it('should successfully get issuer from the discovery document and open authorization url', async function() {
        this.timeout(10000);
        var issuer = await Issuer.discover('http://localhost');

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

        var response;
        try {
            var agent = request.agent();
            assert.doesNotThrow(() => response = await agent.get(url));
        } catch(err) {
            
            console.error(err.message);
            console.error(err.stack);

        }
    });

});