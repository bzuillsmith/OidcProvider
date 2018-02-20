exports.findById = findById;

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

async function findById(ctx, id) {
    var user = users[id];

    return {
        accountId: id,
        async claims() { return { sub: user.id }; },
    };
}
