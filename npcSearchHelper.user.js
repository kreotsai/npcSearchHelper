// ==UserScript==
// @name         NPC Search Helper
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  A script to help search for items more quickly on NPC!
// @author       plushies
// @include      *neopetsclassic.com/games/kadoatery/
// @include      *neopetsclassic.com/faerieland/employ/jobs/*
// @include      *neopetsclassic.com/*
// @include      *neopetsclassic.com/market/
// @include      *neopetsclassic.com/safetydeposit/*
// @include      *neopetsclassic.com/inventory/*
// @icon         https://www.google.com/s2/favicons?domain=neopetsclassic.com
// @updateURL    https://raw.githubusercontent.com/kreotsai/npcSearchHelper/main/npcSearchHelper.user.js
// @downloadURL  https://raw.githubusercontent.com/kreotsai/npcSearchHelper/main/npcSearchHelper.user.js
// @grant        none
// ==/UserScript==

/////////////////// **** NOTES **** /////////////////////////

// *** CURRENTLY WORKING FOR: ****
// Kadoatery
// Inventory
// SDB
// User Shop
// Faerie Quests (RE's and dailies)
// Employment Agency

//Soon I'll be adding Auction & TP search, as well as support for the training school.

//If you encounter any bugs please don't hesitate to let me know!! I'm still learning and I appreciate the help :)
//<3 plushies

/////////////////// **** FUNCTIONS **** /////////////////////////
//Opens shop wiz, sets query to item name, sets search option to 'identical to my phrase'
function openSW(id)
{
    if (id.includes("%27"))
        {
        id = id.replace("%27", "'");
        }
    
    console.log("Item: " + id);

    var wiz = window.open("https://neopetsclassic.com/market/wizard/");
    wiz.addEventListener('load', ()=> {
        console.log('wiz opened');

        //Check if there's a quest
        if (wiz.document.body.innerText.includes("You are on a Faerie Quest and are not allowed to use the Shop Wizard!"))
        {
            console.log("on a quest, can't use SW");

        }
        //No quest, do the search stuff
        else
        {
            wiz.document.getElementsByName("query")[0].value=id;
            wiz.document.getElementsByName("search_method")[0].selectedIndex = 1;
        }
    }, false);

}

//Checks user shop for an item
function checkUserShop(item)
{
    //remove any newlines
    item = item.replace(/(\r\n|\n|\r)/gm, "");

    console.log("Item: " + item);

    var shop = window.open("https://neopetsclassic.com/market/");
    shop.addEventListener('load', ()=> {
        console.log('shop opened');
        let shopItems = getShopItems(shop);

        if (shopItems !== undefined)
        {
            console.log("shop here, continue");

            for(var i = 0, listItem; listItem = shopItems[i]; i++)
            {

                if (listItem.innerText.includes(item))
                {
                    console.log("["+ item + "] was FOUND in row [" + listItem.innerText + "] , centering it on screen");
                    //console.log(listItem);
                    listItem.scrollIntoView({block: "center"});
                    return listItem
                }
                else
                {
                    console.log("["+ item + "] was NOT found in row [" + listItem.innerText + "]");
                }
            }

        }
        else
        {
            console.log("didnt find a shop");
        }



        //end event listener
    }, false);

    //end openUserShop
}



function getShopItems(shop)
{
    if (shop.document.body.innerText.includes("You don't have your own shop yet!"))
    {
        console.log("no shop")
    }
    else
    {
        var itemList = [];
        var shopTable = shop.document.getElementsByClassName("sdbtablebody")
        shopTable = shopTable[0]

        for (var i = 0, row; row = shopTable.rows[i]; i++)
        {
            var cellHTML = row


            cellHTML = cellHTML.getElementsByTagName("td");


            cellHTML = cellHTML[0];


            var itemText = cellHTML.innerText;

            if (itemText !== null)
            {
                if (!cellHTML.innerHTML.includes(`value="Update`))
                {
                    itemList.push(cellHTML);
                }
            }

        }
    return itemList

    }
}

function makeLinks(parentDiv, item)
{
    //im dumb and can't figure out escape chars so here's how to make items with "'" in the name work, if someone can fix this plz do lmao
    if (item.includes("'"))
        {
        item = item.replace("'", "%27");
        }

    //div to hold all the other link divs. (Links are in divs so I can more easily add event listeners to them)
    var linksDiv = document.createElement("div");
    linksDiv.id = item;
    parentDiv.appendChild(linksDiv);

    //sw
    var swDiv = document.createElement("swDiv");
    swDiv.innerHTML = `<a style='font-size:20px;font-weight:100'><img width="20px" id='${item}'src="https://raw.githubusercontent.com/kreotsai/npcShopTools/main/shopwiz.gif"></a>`;
    swDiv.addEventListener("click", function(e) {
        openSW(e.target.id);
    })
    linksDiv.appendChild(swDiv);


    //user shop
    var shopDiv = document.createElement("shopDiv");
    shopDiv.innerHTML = `<a style='font-size:20px;font-weight:100'><img width="20px" id='${item}'src="https://raw.githubusercontent.com/kreotsai/npcShopTools/main/shop.gif"></a>`;
    shopDiv.addEventListener("click", function(e) {
        checkUserShop(e.target.id);
    })
    linksDiv.appendChild(shopDiv);

    //sdb
    var sdbDiv = document.createElement("sdbDiv");
    sdbDiv.innerHTML = `<a target="_blank" href='https://neopetsclassic.com/safetydeposit/?page=1&query=${item}'style='font-size:20px;font-weight:100'><img width="20px" src="https://raw.githubusercontent.com/kreotsai/npcShopTools/main/emptydepositbox.gif"></a>`;
    linksDiv.appendChild(sdbDiv);
}

function getKadItems()
{
    //2004 theme
    var kadTable = document.querySelector("body > table:nth-child(5) > tbody > tr > td:nth-child(3) > div > table > tbody");

    if (kadTable === null)
    {
        console.log("null kadtable, checking again");
        //standard themes
        kadTable = document.querySelector("body > table:nth-child(4) > tbody > tr > td:nth-child(3) > div > table")
    }

if (kadTable === null)
    {
    console.log("null kadtable after 2nd check, returning");
        return
    }

    else
    {


    for (let row of kadTable.rows)
    {
        for(let cell of row.cells)
        {
            let food = cell.innerText;

            if (food.includes("You should give it"))
            {
                food = food.split("is very sad.\n\n\nYou should give it\n")
                food = food[1];

                //console.log(food);

                makeLinks(cell, food)

            }
        }
    }
}}
////////////////////////////////////////////////////****   FEA   **** //////////////////////////////////////

if (window.location.href.includes("neopetsclassic.com/faerieland/employ/jobs/"))
{

//Get the table where the items for sale are listed, store as var 'itemTable'
var itemTable = document.getElementsByClassName("content")[0];
itemTable = itemTable.getElementsByTagName("tbody")[0];


for (var i = 0, row; row = itemTable.rows[i]; i++)
{
 if(row.innerHTML.indexOf("img src") !== -1)
 {
   var itemPic = row.getElementsByTagName("img")[0].getAttribute("src");
 }
 if(row.innerHTML.indexOf("Base Reward") !== -1)
    {
    //Parse out job info from itemTable
    var item = row.innerHTML.split("of:</b> ");
        item = item[1].split("          <br><br>")[0];
        item = item.replace(/\r?\n|\r/g, "");
        console.log(item);

        makeLinks(row, item)
    }

}
}

/////////////////////////////////////////****   KADS   **** //////////////////////////////////////
if (window.location.href.includes("neopetsclassic.com/games/kadoatery/"))
{
    getKadItems();
}

/////////////////////////////////////////****   QUESTS   **** //////////////////////////////////////
//all pages, quest REs

var fqRE = document.getElementsByClassName("faerie_quest")[0]

console.log("initial fqRE = " + fqRE);

if (fqRE === undefined)
    {
        console.log("no quest RE here")
    }

//when there is a FQ RE
    else
    {
        console.log("else fqRE = " + fqRE.innerHTML);

        if(fqRE.innerHTML.indexOf("<b>'") !== -1)
        {
            var questItem = fqRE.getElementsByTagName("b")[1].innerText;
            questItem = questItem.replace("'", "");
            questItem = questItem.replace("'", "");
            console.log(questItem);

            makeLinks(fqRE, questItem);
        }

    }

//quest page
if (window.location.href.includes("neopetsclassic.com/quests"))
{
    console.log("quest page");
    var ps = document.getElementsByTagName("p");

    for (var j = 0, p; p = ps[j]; j++)
    {

    if(ps[j].innerHTML.indexOf("You are currently on a quest!") !== -1)
        {
            questItem = ps[j+1].innerText;
            questItem = questItem.split("brought my ")[1];
            questItem = questItem.split(" back yet?")[0];
            console.log(questItem);

            makeLinks(ps[j+1], questItem)
        }

    }

}

/////////////////// **** SHOP **** /////////////////////////
if (window.location.href.includes("neopetsclassic.com/market/"))
    {
        var shop = window;
        var shopItems = getShopItems(shop)

        if (shopItems !== undefined)
        {

            for(var k = 0, listItem; listItem = shopItems[k]; k++)
            {
                console.log(listItem.innerText)
                var itemText = listItem.innerText

                //console.log(itemText);

                makeLinks(listItem, itemText);
            }

        }

    }

/////////////////// **** SDB **** /////////////////////////
if (window.location.href.includes("neopetsclassic.com/safetydeposit/"))
    {
        console.log("sdb");

        var sdb = window;
        var sdbItems = getShopItems(sdb)

        if (sdbItems !== undefined)
        {

            for(var l = 0, sdbItem; sdbItem = sdbItems[l]; l++)
            {

                var sdbText = sdbItem.innerText
                sdbText = sdbText.split("(")[0];

               console.log(sdbText);

                makeLinks(sdbItem, sdbText);
            }

        }

    }



/////////////////// **** INVENTORY **** /////////////////////////
if (window.location.href.includes("neopetsclassic.com/inventory/"))
    {
        console.log("inventory");

        var inv = window;
        var invItems = inv.document.getElementsByClassName("inventoryitem")

        if (invItems !== undefined)
        {

            for(var m = 0, invItem; invItem = invItems[m]; m++)
            {

                var invText = invItem.innerText
                invText = invText.split("(")[0];

               console.log(invText);

               makeLinks(invItem, invText);
            }

        }

    }




