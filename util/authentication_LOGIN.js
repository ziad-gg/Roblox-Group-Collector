const puppeteer = require('puppeteer');
const wait = require('node:timers/promises').setTimeout;
const axios = require('axios');
const args = require('./browser_args.js');
const fs = require('node:fs/promises');
const { readFileSync, existsSync } = require('node:fs');
const noblox = require('noblox.js');

async function login(username, password, events) {
    const browser = await puppeteer.launch({
        headless: false,
        args: args
    });

    const page = await browser.newPage();
    await page.goto('https://www.roblox.com/login');
    return await restoreLocalStorage(page).then(async () => {

        const cookie = require('../cookies.json').find(e => e.name === ".ROBLOSECURITY").value;
        const AuthUser = await noblox.setCookie(cookie);
        console.log('Loged in as (%s) ', AuthUser.UserName);

        events.on("group", async (link, id) => {
            console.log("Found a Group")
            const group = await browser.newPage()
            
            await group.goto(link);
            await wait(500);
            await group.click('[id="group-join-button"]');
            await wait(800);

            const XCSRF = await getCsrfToken(process.env.cookie);
            await noblox.http(`https://groups.roblox.com/v1/groups/${id}/claim-ownership`, {
                method: 'post',
                headers: {
                    'Cookie': `.ROBLOSECURITY=${process.env.cookie}`, 
                    'X-CSRF-TOKEN': XCSRF, 
                    'Content-Type': 'application/json'
                }
            }).then(e => console.log(e))
        })

    }).catch(async e => {
        await wait(5000);
        page.type('input[id="login-username"]', username);
        await wait(1000);
        page.type('input[id="login-password"]', password);
        await wait(1000);
        await page.waitForSelector('[id="login-button"]');
        page.click('[id="login-button"]');

        events.emit('auth_code');

        events.once('code', async (code) => {
            await page.waitForSelector('[id="two-step-verification-code-input"]');
            page.type('[id="two-step-verification-code-input"]', code);
            await wait(1000);
            page.click('[class="btn-cta-md modal-modern-footer-button"]');
            await wait(1000);

            await page.waitForNavigation({
                timeout: 80_000
            });

            // logged in now, save cookies and local storage
            const cookies = await page.cookies();
            const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage));
            await fs.writeFile('cookies.json', JSON.stringify(cookies));
            await fs.writeFile('localstorage.json', localStorage);

            console.log('loged in as a new Login');
        });
    })

    return 1
};


async function restoreLocalStorage(page) {

    return new Promise(async (res, rej) => {

        if (!(await existsSync('cookies.json')) && !(await existsSync('localStorage.json')) ) return rej('No sessions to Restore');

        const cookiesString = await readFileSync('cookies.json');
        const localStorageData = await readFileSync('localStorage.json', 'utf-8');

        const cookies = JSON.parse(cookiesString);
        const localStorage = JSON.parse(localStorageData);

        await page.setCookie(...cookies);
        await page.evaluate((localStorage) => {
            for (const key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    window.localStorage.setItem(key, localStorage[key]);
                }
            }
        }, localStorage);

        await page.reload();

        res(page)
    });

};

async function getCsrfToken(token) {
    try {
        const response = await fetch(
            "https://friends.roblox.com/v1/users/321/request-friendship",
            {
                method: "POST",
                headers: {
                    Cookie: `.ROBLOSECURITY=${token}`,
                },
            }
        );

        if (response.status === 403) {
            return response.headers.get("x-csrf-token");
        }
    } catch (e) {
        console.log(e);
    }
}

module.exports = login;