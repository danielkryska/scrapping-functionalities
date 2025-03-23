// RUN SCRIPT IN BROWSER
async function loadScript(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch script: ${url}`);
    const scriptContent = await response.text();

    const script = document.createElement("script");
    script.textContent = scriptContent;
    document.documentElement.appendChild(script);
}

// await loadScript('https://raw.githubusercontent.com/danielkryska/scrapping-functionalities/refs/heads/master/script.js');


// NAVIGATION
async function newTab(url = 'about:blank', scripts = ['https://raw.githubusercontent.com/danielkryska/scrapping-functionalities/refs/heads/master/script.js']) {
    console.log(`Opening new tab: "${url}"...`);
    
    return new Promise((resolve, reject) => {
        // Open the new tab
        const newWindow = window.open(url, '_blank');
        
        if (!newWindow) {
            reject(new Error('The new tab couldn\'t be opened. Pop-up might be blocked.'));
            return;
        }
        
        // Focus the new window
        newWindow.focus();
        
        // Function to check if the new window is loaded
        const checkWindowLoad = () => {
            try {
                // Try to access the document state to see if the window is loaded
                // This might fail due to CORS if the URL is on a different domain
                if (newWindow.document.readyState === 'complete') {
                    console.log(`New tab document loaded for: ${url}`);
                    
                    // Load all scripts
                    const loadAllScripts = async () => {
                        try {
                            for (const scriptUrl of scripts) {
                                try {
                                    // We need to execute this in the context of the new window
                                    const script = newWindow.document.createElement('script');
                                    
                                    // Create a promise for script loading
                                    const scriptLoaded = new Promise((resolveScript, rejectScript) => {
                                        script.onload = () => resolveScript();
                                        script.onerror = (e) => rejectScript(e);
                                    });
                                    
                                    // Set the script source
                                    script.src = scriptUrl;
                                    newWindow.document.head.appendChild(script);
                                    
                                    // Wait for script to load
                                    await scriptLoaded;
                                    console.log(`Script loaded in new tab: ${scriptUrl}`);
                                } catch (scriptError) {
                                    console.error(`Error loading script ${scriptUrl}:`, scriptError);
                                }
                            }
                            console.log("All scripts loaded in new tab");
                            resolve(newWindow);
                        } catch (error) {
                            console.error("Error in script loading process:", error);
                            // Still resolve with the window even if scripts fail
                            resolve(newWindow);
                        }
                    };
                    
                    loadAllScripts();
                } else {
                    // Still loading, check again after a delay
                    setTimeout(checkWindowLoad, 100);
                }
            } catch (e) {
                // This could happen due to CORS restrictions
                // Just wait and try again until we get a "load" event
                console.log("Waiting for window to load...");
                setTimeout(checkWindowLoad, 100);
            }
        };
        
        // Add load event listener to the new window
        newWindow.addEventListener('load', function() {
            console.log("Window load event triggered");
            // Try loading scripts after the window has fully loaded
            try {
                const loadScriptsAfterLoad = async () => {
                    for (const scriptUrl of scripts) {
                        try {
                            // Load script in the new window context
                            const script = newWindow.document.createElement('script');
                            script.src = scriptUrl;
                            newWindow.document.head.appendChild(script);
                            console.log(`Script injected: ${scriptUrl}`);
                        } catch (error) {
                            console.error(`Error injecting script ${scriptUrl}:`, error);
                        }
                    }
                    console.log("All scripts injected");
                };
                
                loadScriptsAfterLoad();
                // Resolve with the window object so caller can use it
                resolve(newWindow);
            } catch (e) {
                console.error("Error loading scripts after window load:", e);
                // Still resolve with the window so the caller can use it
                resolve(newWindow);
            }
        }, { once: true });
        
        // Start checking if we can determine when the document is ready
        checkWindowLoad();
        
        // Set a timeout to resolve anyway if things take too long
        setTimeout(() => {
            console.log("Timeout reached, resolving with window regardless of script status");
            resolve(newWindow);
        }, 10000);
    });
}

function closeTab() {
    window.close();
}

function setTabActive() {
    console.log(`Set current tab active...`);
    window.focus();
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
        return escapeMarkdownSpecialChars(element.textContent?.trim() || '');
    }

    // Ensure we have a valid element with nodeName
    if (!element.nodeName) return '';

    // Safely get lowercase node name
    const nodeName = (element.nodeName || '').toLowerCase();

    // Switch statement with node name processing
    switch (nodeName) {
        case 'div':
        case 'body':
        case 'html':
            return processChildNodes(element);

        case 'dl':
            return processDefinitionList(element);

        case 'dt':
            return `**${processNodeContent(element)}**\n\n`;

        case 'dd':
            return `${processNodeContent(element)}\n\n`;

        case 'span':
            return processNodeContent(element);

        case 'h1': return `# ${processNodeContent(element)}\n\n`;
        case 'h2': return `## ${processNodeContent(element)}\n\n`;
        case 'h3': return `### ${processNodeContent(element)}\n\n`;
        case 'h4': return `#### ${processNodeContent(element)}\n\n`;
        case 'h5': return `##### ${processNodeContent(element)}\n\n`;
        case 'h6': return `###### ${processNodeContent(element)}\n\n`;

        case 'p':
            return `${processNodeContent(element)}\n\n`;

        case 'strong':
        case 'b': return `**${processNodeContent(element)}**`;

        case 'em':
        case 'i': return `*${processNodeContent(element)}*`;

        case 'a': {
            const href = element.getAttribute('href') || '';
            const text = processNodeContent(element);
            return `[${text}](${href})`;
        }

        case 'ul':
            return Array.from(element.children || [])
                .map(li => `- ${processNodeContent(li)}\n`)
                .join('') + '\n';

        case 'ol':
            return Array.from(element.children || [])
                .map((li, index) => `${index + 1}. ${processNodeContent(li)}\n`)
                .join('') + '\n';

        case 'li': {
            const childContent = processNodeContent(element);
            return childContent.trim();
        }

        case 'code':
            return `\`${processNodeContent(element)}\``;

        case 'pre':
            return `\`\`\`\n${processNodeContent(element)}\n\`\`\`\n\n`;

        case 'blockquote':
            return `> ${processNodeContent(element)}\n\n`;

        default:
            return processNodeContent(element);
    }
}

function processDefinitionList(element) {
    return Array.from(element.children || [])
        .map(child => {
            const nodeName = child.nodeName.toLowerCase();
            switch (nodeName) {
                case 'dt':
                    return `**${processNodeContent(child)}**\n\n`;
                case 'dd':
                    return `${processNodeContent(child)}\n\n`;
                default:
                    return processNodeContent(child);
            }
        })
        .join('');
}

function processChildNodes(node) {
    if (!node) return '';

    return Array.from(node.childNodes || [])
        .map(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                return escapeMarkdownSpecialChars(child.textContent?.trim() || '');
            }
            return htmlToMarkdown(child);
        })
        .filter(content => content.trim() !== '')
        .join('\n');
}

function processNodeContent(node) {
    if (!node) return '';

    // If it's a text node, return escaped content
    if (node.nodeType === Node.TEXT_NODE) {
        return escapeMarkdownSpecialChars(node.textContent?.trim() || '');
    }

    // Process child nodes
    const childContents = Array.from(node.childNodes || [])
        .map(child => {
            // Recursive processing of child nodes
            if (child.nodeType === Node.TEXT_NODE) {
                return escapeMarkdownSpecialChars(child.textContent?.trim() || '');
            }
            return htmlToMarkdown(child);
        })
        .filter(content => content.trim() !== '')
        .join(' ');

    return childContents.trim();
}

function escapeMarkdownSpecialChars(text) {
    return text
        .replace(/([\\`*_{}[\]()#+\-.!])/g, '\\$1')
        .replace(/\n/g, ' ');
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
    goToVideos: async () => await newTab('https://getpocket.com/saves/videos') && await waitUntil(element(POCKET_PUBLISHER_SELECTOR), { visible: true }),
    goToArticls: async () => await newTab('https://getpocket.com/saves/articles') && await waitUntil(element(POCKET_PUBLISHER_SELECTOR), { visible: true }),

    itemsSize: async () => (allElements(POCKET_PUBLISHER_SELECTOR)).length,
    getPublisher: async (childNr) => getText(element(`${POCKET_PUBLISHER_SELECTOR}:nth-child(${childNr})`)),
    getOriginUrl: async (childNr) => getAttribute(element(`${POCKET_PUBLISHER_SELECTOR}:nth-child(${childNr})`), 'href'),
    getTitle: async (childNr) => getText(element(`${POCKET_PUBLISHER_SELECTOR}:nth-child(${childNr})`)),

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
    goToChat: async () => await newTab(GEMINI_CHAT_URL) && await waitUntil(element(GEMINI_CHAT_INPUT_SELECTOR), { visible: true }),
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
