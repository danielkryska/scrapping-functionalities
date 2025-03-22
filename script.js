// NAVIGATION
async function newTab(url = 'about:blank', scripts = []) {
    console.log(`Open new tab: "${url}"...`);
    return new Promise((resolve, reject) => {
        const tab = window.open(url, '_blank');

        if (!tab) {
            reject(new Error('Nie udało się otworzyć nowej karty.'));
            return;
        }

        const checkLoad = () => {
            try {
                if (tab.document.readyState === 'complete') {
                    console.log(`Tab "${url}" loaded.`);

                    // Dodajemy skrypty po załadowaniu
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
// await newTab('', ['https://raw.githubusercontent.com/danielkryska/scrapping-functionalities/refs/heads/master/script.js])

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

      // Czekamy na załadowanie wszystkich skryptów
      Promise.all(loadScripts)
        .then(results => resolve(results))
        .catch(error => reject(error));
    };

    window.addEventListener('load', onLoad, { once: true });

    // Przekierowanie
    window.location.href = url;
  });
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
    console.log(`Set value for "${el.tagName}", value: "${value}"...`);
  
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

async function waitUntil(selector, config = { visible: false, exists: true, clickable: false }, timeout = 5000) {
    console.log(`Wait until "${element.tagName}" is "${JSON.stringify(config)}" until "${timeout}" will pass...`);
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const element = document.querySelector(selector);
        if (element) {
            if (config.exists && !element) continue;
            if (config.visible && getComputedStyle(element).display === 'none') continue;
            if (config.clickable && element.disabled) continue;
            return element;
        }
        await wait(500);
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


// INTERFACES
const getPocket = {
    goToVideos: async () => await goToUrl('https://getpocket.com/saves/videos'),
    goToArticls: async () => await goToUrl('https://getpocket.com/saves/articles'),
    
    isContentLoaded: async () => await waitUntil(await select('a.publisher'), { visible: true }),
    
    getPublishersSize: async () => (await selectAll('a.publisher')).length,
    getPublisher: async (childNr) => getText(await select(`a.publisher:nth(${childNr})`)),
    getOriginUrl: async (childNr) => getAttribute(await select(`a.publisher:nth(${childNr})`), 'href'),
    getTitle: async (childNr) => getText(await select(`a.publisher:nth(${childNr})`))
}

