exports.findById = findById;
exports.findByEmail = findByEmail;

const users = [
    {
        id: '12345abcdef',
        given_name: 'Ben',
        family_name: 'Z',
        email: 'ben@__fake__.com'
    },
    {
        id: 'abcdef12345',
        given_name: 'Ron',
        family_name: 'S',
        email: 'ron@__fake__.com'
    }
];

async function findByEmail(email) {
    return findUser(u => u.email == email);
}

async function findById(req, id) {
    return findUser(u => u.id == id);
}

function findUser(fn) {
    var theUser = null;
    for(var user of users) {
        if(fn(user)) {
            theUser = user;
            break;
        }
    }
    
    if (theUser == null) return null;
    
    return Object.assign({}, theUser, {
        sub: this.accountId,
    });
}
