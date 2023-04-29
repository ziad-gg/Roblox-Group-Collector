const noblox = require('noblox.js');
const axios = require('axios');
require('dotenv').config();

const getUnclaimedGroups = async (keyword) => {

    await noblox.setCookie(process.env.cookie);
    const csrfToken = await noblox.getGeneralToken();

    const response = await axios.get('https://groups.roblox.com/v1/groups/search', {
        headers: {
            'Cookie': `.ROBLOSECURITY=${process.env.cookie}`,
            'Referer': 'https://www.roblox.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
            'X-CSRF-TOKEN': csrfToken,
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br'
        },
        params: {
            keyword,
            sort: 'Relevance',
            limit: 100,
            cursor: '',
            isClan: false,
            contextCountryCode: 'US',
            languageCode: 'en',
            searchCategory: 'All',
            sortType: 'Asc',
            startDate: '',
            endDate: '',
            minMemberCount: '',
            maxMemberCount: '',
            roleFilter: '',
            ownerId: '',
            memberCountFilter: '',
            groupCategory: ''
        }
    });

    
    const groups = await (response.data).data;
    const unclaimedGroups = groups.filter(async group => {
        const g = await axios.get(`https://groups.roblox.com/v1/groups/${group.id}`).then(g => g).catch(e => process.kill(1));
        return !g.data.owner && g.data.isLocked
    });
    return unclaimedGroups;
};


async function loop() {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    for await (const letter of letters) {
        return getUnclaimedGroups(`${letter}  `)
        .then(unclaimedGroups => console.log(unclaimedGroups))
        .catch(error => console.error(error.data));
    }
}

loop()


