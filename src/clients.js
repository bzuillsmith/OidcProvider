const clients = [{
    client_id: 'myapp',
    response_types: ['code'],
    grant_types: ['authorization_code'],
    redirect_uris: ['http://localhost/redirect'],
    token_endpoint_auth_method: 'none',
    application_type: 'native'
}];

module.exports = clients;