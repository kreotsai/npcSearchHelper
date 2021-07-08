// ==UserScript==
// @name         NPC Search Helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  A script to help search for items more quickly on NPC!
// @author       plushies
// @include      *neopetsclassic.com/games/kadoatery/
// @icon         https://www.google.com/s2/favicons?domain=neopetsclassic.com
// @updateURL    https://raw.githubusercontent.com/kreotsai/npcSearchHelper/main/npcSearchHelper.user.js
// @downloadURL  https://raw.githubusercontent.com/kreotsai/npcSearchHelper/main/npcSearchHelper.user.js
// @grant        none
// ==/UserScript==

// *** CURRENTLY ONLY WORKING AT THE KADOATERY ****
//I'm planning on adding functionality soon for inventory, shop, SDB, FEA, or wherever else it's wanted :]


//Opens shop wiz, sets query to item name, sets search option to 'identical to my phrase'
function openSW(id)
{
    console.log(id);

    var wiz = window.open("https://neopetsclassic.com/market/wizard/");
    wiz.addEventListener('load', ()=> {
        console.log('wiz opened');
        wiz.document.getElementsByName("query")[0].value=id;
        wiz.document.getElementsByName("search_method")[0].selectedIndex = 1;
    }, false);

}

//Checks user shop for an item
function checkUserShop(item)
{
    console.log(item);

    var shop = window.open("https://neopetsclassic.com/market/");
    shop.addEventListener('load', ()=> {
        console.log('shop opened');
        let shopItems = getShopItems(shop);

        for(var i = 0, listItem; listItem = shopItems[i]; i++)
        {

            if (listItem.innerText.includes(item))
            {
                console.log(item + " was FOUND in row " + listItem.innerText + ", centering it on screen");
                //console.log(listItem);
                listItem.scrollIntoView({block: "center"});
                return listItem
            }
            else
            {
                console.log(item + " was NOT found in row " + listItem.innerText);
            }
        }





        //end event listener
    }, false);

    //end openUserShop
}



function getShopItems(shop)
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


function makeLinks(parentDiv, item)
{
    //im dumb and can't figure out escape chars so here's how to make items with "'" in the name work, if someone can fix this plz do lmao
    item = item.replace("'", "%27");

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
    let kadTable = document.querySelector("body > table:nth-child(5) > tbody > tr > td:nth-child(3) > div > table > tbody");

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
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
if (window.location.href.includes("neopetsclassic.com/games/kadoatery/"))
{
    getKadItems();
}

