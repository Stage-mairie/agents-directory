AUTHORIZED_USERS = {
    'admin': 'secret',
    'user3': 'pwd3'
}

ADMINS = ['admin']

def is_authorized(username, password):
    return AUTHORIZED_USERS.get(username) == password

def is_admin(username):
    return username in ADMINS
