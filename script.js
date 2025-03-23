// RUN SCRIPT IN BROWSER
async function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}
// await loadScript('https://raw.githubusercontent.com/danielkryska/scrapping-functionalities/refs/heads/master/lib.js');


// NAVIGATION
async function newTab(url = 'about:blank', scripts = ['https://raw.githubusercontent.com/danielkryska/scrapping-functionalities/refs/heads/master/script.js']) {
    console.log(`Open new tab: "${url}"...`);
    return new Promise((resolve, reject) => {
        const tab = window.open(url, '_blank');

        if (!tab) {
            reject(new Error('The new tab couldn\'t be open.'));
            return;
        }

        const checkLoad = () => {
            try {
                if (tab.document.readyState === 'complete') {
                    console.log(`Tab "${url}" loaded.`);
                    window.focus();

                    scripts.forEach(scriptUrl => {
                        const script = tab.document.createElement('script');
                        script.src = scriptUrl;
                        script.async = true;
                        tab.document.head.appendChild(script);
                    });

                    resolve(tab);
                } else {
                    setTimeout(checkLoad, 100);
                }
            } catch (e) {
                setTimeout(checkLoad, 100);
            }
        };

        checkLoad();
    });
}

function closeTab() {
    window.close();
}

function setTabActive() {
    console.log(`Set current tab active...`);
    window.focus();
}

async function goToUrl(url, scripts = []) {
    console.log(`Going to "${url}"...`);

    return new Promise((resolve, reject) => {
        if (typeof url !== 'string' || url.trim() === '') {
            reject(new Error('Invalid URL'));
            return;
        }

        // Przechwytujemy zdarzenie załadowania strony
        const onLoad = () => {
            console.log(`Page "${url}" loaded.`);

            // Dodawanie skryptów
            const loadScripts = scripts.map(scriptUrl => {
                return new Promise((scriptResolve, scriptReject) => {
                    const script = document.createElement('script');
                    script.src = scriptUrl;
                    script.async = true;
                    script.onload = () => scriptResolve(`Script laoded: ${scriptUrl}`);
                    script.onerror = () => scriptReject(new Error(`Error while loading script: ${scriptUrl}`));
                    document.head.appendChild(script);
                });
            });

            Promise.all(loadScripts)
                .then(results => resolve(results))
                .catch(error => reject(error));
        };
        window.addEventListener('load', onLoad, { once: true });
        window.location.href = url;
    });
}

// SELECT

function allElements(selector) {
    console.log(`Selecting all elements by "${selector}"...`);
    return Array.from(document.querySelectorAll(selector));
}

function element(selector) {
    console.log(`Selecting element by "${selector}"...`);
    return document.querySelector(selector);
}


// SET, GET
function setValue(selector, value) {
    console.log(`Set value for "${selector}", value: "${value}"...`);

    let event = new Event('input', {
        bubbles: true,
        cancelable: true,
    });
    const el = element(selector);
    const type = el.tagName;

    const TEXTAREA = 'TEXTAREA';
    const INPUT = 'INPUT';
    if (type === INPUT || type === TEXTAREA) {
        el.value = value;
    }
    else {
        el.innerText = value;
    }

    console.log(`Setting value ${value} for ${selector}`);
    el.dispatchEvent(event);
}

function getAttribute(element, attribute) {
    console.log(`Get attribute "${attribute}" from "${element.tagName}"`)
    return element.getAttribute(attribute);
}

function getText(element) {
    console.log(`Get innerText from "${element.tagName}"`)
    return element.innerText;
}


// STORE
async function storeFile(nameWithExtension, content) {
    console.log(`Storying file "${nameWithExtension}"...`);
    const a = document.createElement('a');
    a.download = nameWithExtension;
    a.href = window.URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.click();
    window.URL.revokeObjectURL(a.href);
}


// WAIT
var tm_control;
function wait(time) {
    console.log(`Waiting "${time}" sec...`);
    clearInterval(tm_control);
    return new Promise(resolve => tm_control = setTimeout(resolve, time));
}

async function waitUntil(selector, config = { visible: false, exists: true, clickable: false }, timeout = 5000, stepWaitTime = 500) {
    console.log(`Wait until "${selector}" is "${JSON.stringify(config)}" until "${timeout}" will pass...`);
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const foundElement = element(selector);
        if (foundElement) {
            if (config.exists !== undefined && config.exists && !foundElement) continue;
            if (config.visible !== undefined && config.visible && getComputedStyle(foundElement).display === 'none') continue;
            if (config.clickable !== undefined && config.clickable && foundElement.disabled) continue;
            return foundElement;
        }
        await wait(stepWaitTime);
    }
    throw new Error(`Element ${selector} not found within timeout`);
}


// COOKIES
function clearCookies() {
    console.log("Clear all cookies...");
    document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie.replace(/^\s*([^=]+)=[^;]*(;?.*)$/, '$1=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/');
    });
}


// Copy to clipboard substitude
function htmlToMarkdown(element) {
    console.log(`Converting HTML to Markdown...`);

    // Early return for null, undefined, or non-object inputs
    if (!element || typeof element !== 'object') return '';

    // Handle text nodes
    if (element.nodeType === Node.TEXT_NODE) {
        return element.textContent?.trim() || '';
    }

    // Ensure we have a valid element with nodeName
    if (!element.nodeName) return '';

    // Safely get lowercase node name
    const nodeName = (element.nodeName || '').toLowerCase();

    // Switch statement with node name processing
    switch (nodeName) {
        case 'h1': return `# ${element.textContent?.trim() || ''}\n`;
        case 'h2': return `## ${element.textContent?.trim() || ''}\n`;
        case 'h3': return `### ${element.textContent?.trim() || ''}\n`;
        case 'h4': return `#### ${element.textContent?.trim() || ''}\n`;
        case 'h5': return `##### ${element.textContent?.trim() || ''}\n`;
        case 'h6': return `###### ${element.textContent?.trim() || ''}\n`;

        case 'p':
            return `${element.textContent?.trim() || ''}\n\n`;

        case 'strong':
        case 'b': return `**${element.textContent?.trim() || ''}**`;

        case 'em':
        case 'i': return `*${element.textContent?.trim() || ''}*`;

        case 'a':
            return `[${element.textContent?.trim() || ''}](${element.getAttribute('href') || ''})`;

        case 'ul':
            return Array.from(element.children || [])
                .map(li => `- ${htmlToMarkdown(li).trim()}\n`)
                .join('') + '\n';

        case 'ol':
            return Array.from(element.children || [])
                .map((li, index) => `${index + 1}. ${htmlToMarkdown(li).trim()}\n`)
                .join('') + '\n';

        case 'li': {
            // Handle nested elements within list items
            const childContent = Array.from(element.childNodes || [])
                .map(child => {
                    // Check if it's a text node or needs special processing
                    if (child.nodeType === Node.TEXT_NODE) {
                        return child.textContent?.trim() || '';
                    }
                    return htmlToMarkdown(child);
                })
                .filter(content => content.trim() !== '')
                .join(' ');

            return childContent.trim();
        }

        default:
            // Recursively process child nodes for unknown elements
            return Array.from(element.childNodes || [])
                .map(child => htmlToMarkdown(child))
                .filter(content => content.trim() !== '')
                .join(' ');
    }
}

// YT Transcription interface
const getTranscriptionFor = async (ytUrl) => {
    // redirect & load
    let transcriptionToolUrl = 'https://tactiq.io/tools/youtube-transcript';
    await newTab(transcriptionToolUrl);
    clearCookies();

    // run generation
    let inputSelector = '#yt-2';
    let submitBtnSelector = 'input[type="submit"]';

    await waitUntil(inputSelector, { visible: true }, 1500);
    await setValue(inputSelector, ytUrl);
    await wait(1000);
    (await element(submitBtnSelector)).click();

    // get content
    try {
        const transcriptionLineSelector = '#transcript .flex';
        await waitUntil(inputSelector, { visible: true }, 20000, 2000);
        await wait(3000);

        const content = Array.from(allElements('#transcript .flex a'))
            .map(el => el.innerText + " ");
        await wait(1000);
        closeTab();
        return content;
    } catch (e) {
        // redirect & load
        transcriptionToolUrl = 'https://notegpt.io/youtube-transcript-generator';
        closeTab();
        await newTab(transcriptionToolUrl);
        clearCookies();

        // run generation
        inputSelector = 'div.script-youtube-2_main input.el-input__inner';
        submitBtnSelector = 'div.script-youtube-2_main button.el-button--success';

        await waitUntil(inputSelector, { visible: true }, 1500);
        await setValue(inputSelector, ytUrl);
        await wait(1000);
        (element(submitBtnSelector)).click();

        // get content
        const transcriptionLineSelector = 'div.ng-transcript-item div.ng-transcript-item-text';
        await waitUntil(inputSelector, { visible: true }, 20000, 2000);
        await wait(3000);

        const targetDiv = element('.ng-transcript div[role="group"]');
        const contentMap = {};
        const storeContent = () => Array.from(allElements('.ng-transcript .ng-transcript-item'))
            .forEach(el => {
                const timestamp = element('.ng-transcript-item-time').innerText;
                const content = element('.text-container').innerText;
                console.log("Content for: ", timestamp);

                if (!contentMap[timestamp]) {
                    contentMap[timestamp] = content;
                }
            });

        storeContent();
        const observer = new MutationObserver(async (mutations) => {
            const paddingMutation = mutations.find((mutation) => mutation.type === 'attributes' && mutation.attributeName === 'style');

            if (paddingMutation) {
                storeContent();
            }
        });

        observer.observe(targetDiv, {
            attributes: true,
            attributeFilter: ['style'],
        });

        const scrollableDiv = element('.ng-transcript > div');
        const content = new Promise(async (resolve) => {
            const scrollableDiv = element('#your-scrollable-div'); // Make sure to select the right element
            const contentMap = {}; // Assuming this is defined elsewhere

            const scroll = setInterval(() => {
                const currentScrollHeight = scrollableDiv.scrollTop;
                scrollableDiv.scrollTop += 200;

                if (currentScrollHeight === scrollableDiv.scrollTop) {
                    clearInterval(scroll);
                    storeContent(); // Assuming this updates contentMap
                    const content = Object.values(contentMap).reduce((acc, val) => acc += "\n\n" + val, "");

                    // Return the content via Promise resolution instead of using automaSetVariable
                    resolve(content);
                }
            }, 500);
            await wait(1000);
            closeTab();
            return content;
        });
    }
};


// Get Pocket interface
const POCKET_PUBLISHER_SELECTOR = 'a.publisher';
const POCKET_ITEM_OPTIONS_SELECTOR = (childNr) => `article[data-testid="article-card"]:nth-child(${childNr}) button[data-testid="overflow"]`;
const POCKET_ITEM_TITLE_SELECTOR = (childNr) => `article[data-testid="article-card"]:nth-child(${childNr}) h2.title`;
const POCKET_ITEM_REMOVE_SELECTOR = (childNr) => `article[data-testid="article-card"]:nth-child(${childNr}) div[data-testid="Delete"]`;
const getPocket = {
    goToVideos: async () => await goToUrl('https://getpocket.com/saves/videos') && await waitUntil(element(POCKET_PUBLISHER_SELECTOR), { visible: true }),
    goToArticls: async () => await goToUrl('https://getpocket.com/saves/articles') && await waitUntil(element(POCKET_PUBLISHER_SELECTOR), { visible: true }),

    getPublishersSize: async () => (allElements(POCKET_PUBLISHER_SELECTOR)).length,
    getPublisher: async (childNr) => getText(element(`${POCKET_PUBLISHER_SELECTOR}:nth(${childNr})`)),
    getOriginUrl: async (childNr) => getAttribute(element(`${POCKET_PUBLISHER_SELECTOR}:nth(${childNr})`), 'href'),
    getTitle: async (childNr) => getText(element(`${POCKET_PUBLISHER_SELECTOR}:nth(${childNr})`)),

    removeItem: async (childNr) => (await waitUntil(POCKET_ITEM_OPTIONS_SELECTOR(childNr), { visible: true })).click() && (await waitUntil(POCKET_ITEM_REMOVE_SELECTOR(childNr), { visible: true })).click()
};


// Gemini chat
const GEMINI_CHAT_NEW_CHAT_SELECTOR = '#app-root > main > side-navigation-v2 > bard-sidenav-container > bard-sidenav > div > div > div.side-nav-button-container > div > expandable-button > button > span.mat-mdc-button-touch-target';
const GEMINI_CHAT_INPUT_SELECTOR = 'div.ql-editor.textarea > p';
const GEMINI_CHAT_SUBMIT_SELECTOR = '.send-button[aria-disabled="false"] > mat-icon';
const GEMINI_CHAT_URL = 'https://gemini.google.com/app';
const GEMINI_CHAT_STOP_BTN_SELECTOR = 'mat-icon[data-mat-icon-name="stop"]';
const GEMINI_RESPONSE_SELECTOR = 'message-content';

const geminiChat = {
    goToChat: async () => await goToUrl(GEMINI_CHAT_URL) && await waitUntil(element(GEMINI_CHAT_INPUT_SELECTOR), { visible: true }),
    setPrompt: async (text) => setValue(GEMINI_CHAT_INPUT_SELECTOR, text) && await wait(1000),
    submitPrompt: async () => (await element(GEMINI_CHAT_SUBMIT_SELECTOR)).click() && await wait(1000),
    newChat: async () => (await element(GEMINI_CHAT_NEW_CHAT_SELECTOR)).click() && await wait(1000),
    getResponse: async () => {
        const isResponding = () => element(GEMINI_CHAT_STOP_BTN_SELECTOR) !== null;
        while (isResponding()) {
            await wait(3000);
        }
        await wait(3000);
        return htmlToMarkdown(element(GEMINI_RESPONSE_SELECTOR));
    }
};


// Chat gpt


// Bing


// Claude


// DeepSeek


// Grok


// Agents
const SUMMARIZER_AGENT_PROMPT = `
    As a professional summarizer, create a concise and comprehensive summary of the provided text, be it an article, post, 
    conversation, or passage, while adhering to these guidelines:
    Craft a summary that is detailed, thorough, in-depth, and complex, while maintaining clarity and conciseness.
    Incorporate main ideas and essential information, eliminating extraneous language and focusing on critical aspects.
    Rely strictly on the provided text, without including external information.
    Format the summary in paragraph form for easy understanding.
`;


// Notes
/**
 * 
 * @param {*} sourceUrl 
 * @param {'video' | 'article'} medium 
 * @returns 
 */
const NOTE_HEADER = (sourceUrl, medium) => `---
Favorite: false
Archived: false
tags: 
Version: 3
Sources: 
sticker: lucide//highlighter
aliases:
Areas:
---

#medium/${medium}

URL: ${sourceUrl}
`;
