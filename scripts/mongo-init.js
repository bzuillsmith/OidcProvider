/* globals db */
db.client.update({
    _id: "myapp"
},
{
    _id: "myapp",
    client_id: 'myapp',
    response_types: ['code'],
    grant_types: ['authorization_code'],
    redirect_uris: ['http://localhost/redirect'],
    token_endpoint_auth_method: 'none',
    application_type: 'native'
},
{
    upsert: true
});