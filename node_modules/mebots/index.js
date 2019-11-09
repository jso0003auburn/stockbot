const fetch = require('node-fetch');

HOST = 'https://mebotsco.herokuapp.com';
API_ROOT = '/api/'

class Bot {
    constructor(slug, token) {
        this.slug = slug;
        this.token = token;
    }
    req(endpoint) {
        let url = new URL(HOST + API_ROOT + endpoint),
            params = {token: this.token};
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        return fetch(url)
            .then(res => res.json())
            .catch(err => { throw err });
    }
    getInstance(group_id) {
        return this.req('bot/' + this.slug + '/instance/' + group_id);
    }
}

exports.Bot = Bot;
