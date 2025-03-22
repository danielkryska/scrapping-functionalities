// TABS
function newTab(url = 'about:blank', scripts = []) {
    console.log(`Open new tab: "${url}"...`);
    const tab = window.open(url, '_blank');
    if (tab) {
        tab.onload = () => {
            scripts.forEach(scriptUrl => {
                const script = tab.document.createElement('script');
                script.src = scriptUrl;
                script.async = true;
                tab.document.head.appendChild(script);
            });
        };
    }
    return tab;
}
// newTab('', ['https://raw.githubusercontent.com/danielkryska/scrapping-functionalities/refs/heads/master/script.js])

function closeTab() {
    window.close();
}

function setTabActive() {
    console.log(`Set current tab active...`);
    window.focus();
}


// SELECT
function selectAll(selector) {
    console.log(`Looking for "${selector}" elements...`)
    return new Promise(resolve => {
        if (querySelectorShadows(selector)) {
            return resolve(querySelectorShadows(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (querySelectorShadows(selector)) {
                observer.disconnect();
                resolve(querySelectorShadows(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function select(selector) {
  console.log(`Looking for "${selector}" element...`)
    return selectAll(selector)[0];
}


// SET, GET
function setValue(element, value) {
    console.log(`Set value for ${el.tagName}, value: ${value}...`);
  
    let event = new Event('input', {
  	    bubbles: true,
  	    cancelable: true,
  	});
  	const el = await element(selector);
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

function getAttributeFrom(element, attribute) {
    return element.getAttribute(attribute);
}


// STORE
async function storeFile(nameWithExtension, content) {
    console.log(`Storying file ${nameWithExtension}`);
    const a = document.createElement('a');
    a.download = nameWithExtension;
  	a.href = window.URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  	a.click();
    window.URL.revokeObjectURL(a.href);
}


// WAIT
var tm_control;
function wait(time) {
    clearInterval(tm_control);
    return new Promise(resolve => tm_control = setTimeout(resolve, time));
}

async function waitUntil(selector, config = { visible: false, exists: true, clickable: false }, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const element = document.querySelector(selector);
        if (element) {
            if (config.exists && !element) continue;
            if (config.visible && getComputedStyle(element).display === 'none') continue;
            if (config.clickable && element.disabled) continue;
            return element;
        }
        await wait(100);
    }
    throw new Error(`Element ${selector} not found within timeout`);
}


// COOKIES
function clearCookies() {
    document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie.replace(/^\s*([^=]+)=[^;]*(;?.*)$/, '$1=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/');
    });
}


// INTERFACES\

