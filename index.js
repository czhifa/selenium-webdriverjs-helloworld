var webdriver = require('selenium-webdriver');
webdriver.promise.USE_PROMISE_MANAGER = false;//promise manager will be deprecated, bet not use it at all
var driver = new webdriver.Builder().forBrowser('chrome').build();

//console.log('>> USE_PROMISE_MANAGER:',webdriver.promise.USE_PROMISE_MANAGER);

driver.get('https://www.carrefour.com.br');//driver.get('https://carrefour.local:9002');


var input = driver.findElement(webdriver.By.name('termo'));
var submitButton = driver.findElement(webdriver.By.className('submit-search-icon'));
var pdpPrice = '';
var autocompletePrice = '';

//var search = driver.findElement(webdriver.By.className('crf-autocomplete'));
//var searchProducts = search.findElement(webdriver.By.className('products'));
driver.wait(webdriver.until.elementIsVisible(input)).then().catch()
input.sendKeys('pneu').then(sendKeys).catch(function(e){console.log('error promisse', e)});
function sendKeys(){
    console.log('[Buscando por "pneu". Esperando autocomplete...]')
    driver.wait(webdriver.until.elementIsVisible(driver.findElement(webdriver.By.css('.crf-autocomplete'))))
    .then(listProducts).catch(function(){});;
}

function listProducts(){
    driver.findElements(webdriver.By.css('.crf-autocomplete .products .ui-menu-item'))
    .then(function(arr) {
        var firstItem;
        if(!arr.length) {
            console.log('[Nenhum resultado encontrado para o termo buscado]');
            return;
        }
        firstItem = arr[0];
        firstItem.findElement(webdriver.By.css('.price'))
        .then(function(e){
            e.getText().then(function(a) { 
                autocompletePrice = a.replace("R$ ","").trim();//using trim to remove possible whitespaces
                console.log('>> Preço no primeiro resultado do autocomplete:', a);
                firstItem.click().then(afterClick).catch(function () { });
                console.log('[Indo pra PDP]');
            }).catch(function(){console.log('** PROBLEMA AO ANALISAR RESULTADO ** FINALIZANDO...')});
        }).catch(function(){});
        console.log('['+arr.length+' produto(s) encontrado(s), analisando primeiro resultado...]');
        //console.log('ARRAY DE PRODUTOS:', arr.length, 'clicando no item..');        
    })
    
}

function afterClick(){
    driver.wait(webdriver.until.elementIsVisible(driver.findElement(webdriver.By.className('prince-product-default')))).then(function(e){
        console.log('[PDP carregada]');
        e.getText().then(function(f){
            pdpPrice = f.replace("Por: ","").replace("R$ ","").trim();//using trim to remove possible whitespaces
            console.log('>> Preço na pdp: ', f);
            console.log(comparePrices());
            driver.quit();
        }).catch(function() { });
    });
}

function comparePrices(){
    var res = "******\n****** PREÇOS DIFERENTES, VERIFIQUE INDEXAÇÃO NO SOLR \n******";
    if(pdpPrice.toString() === autocompletePrice.toString())
        res = "******\n****** PREÇOS IGUAIS, INDEXAÇÃO NO SOLR PARECE ESTAR CORRETA \n******";
    return res+pdpPrice.toString()+" "+autocompletePrice.toString()+" "+(pdpPrice.toString() === autocompletePrice.toString());
}
