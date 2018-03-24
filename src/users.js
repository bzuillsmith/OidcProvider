exports.findByEmail = findByEmail;

const users = {
    '12345abcdef': {
        id: '12345abcdef',
        given_name: 'Ben',
        family_name: 'Z',
        email: 'ben@__fake__.com',
    },
    'abcdef12345': {
        id: 'abcdef12345',
        given_name: 'Ron',
        family_name: 'S',
        email: 'ron@__fake__.com',
    }
};

async function findByEmail(email) {
    var theUser = null;
    for(var user of users) {
        if(user.email === email) {
            theUser = user;
            break;
        }
    }
    
    return {
        accountId: theUser.id,
        async claims() { return { sub: user.id }; },
    };
}
