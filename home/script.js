"use strict";

let user;

function getSession() {
    let result;
    if(localStorage.getItem("session") != null ) {
        result = JSON.parse(localStorage.getItem("session"));
    } else {
        result = {user_ID: 1, user_Name: "visiteur"};
    }
    localStorage.removeItem("viewType");
    localStorage.removeItem("viewPlay");
    localStorage.removeItem("viewIndex");
    return result;
}

function getPlaylist(user, type, page = 0) {
    let result = "";
    $.get(`https://api.kulty.app/user_info/${type}_list.php`, {id: user, page})
        .done((data) => {
            if(typeof(data) == "object") {
                result = data;
            } else if(data = "false") {
                result = [];
                /* result[0][`${type.slice(0,4)}_ID`] = "0";
                result[0][`${type.slice(0,4)}_Name`] = "Vous ne suivez aucune playlist";
                result[0][`${type.slice(0,4)}_Photo`] = undefined; */
            } else {
                returnError();
            };
        })
        .fail((data) => {
            returnError();
        });
        function returnError() {
            result = [{}];
            result[0][`${type.slice(0,4)}_ID`] = "ERROR";
            result[0][`${type.slice(0,4)}_Name`] = "ERROR";
            result[0][`${type.slice(0,4)}_Photo`] = undefined;
        }
    return result;
}
function getFriends(user) {
    let result = "";
    let frlist;
    $.get("https://api.kulty.app/user_info/friend_list.php", {id: user})
        .done((data) => {
            if(typeof(data) == "object") {
                result = data;
                frlist = `<div class="friend-list">
                    <div class="friend-title">
                        <h2>Vos amis/es ont aimé</h2>
                    </div>
                    <div class="friend-carousel" id="friend-carousel"></div>
                    <div class="friend-expo-list" id="friend-expo-list"></div>
                </div>`;
                
            } else if(data == false) {
                result = data;
                frlist = `<div class="friends">
                </div>`;
            } else {
                result = [{
                    "user_ID": "ERROR",
                    "user_Name": "ERROR",
                    "user_PFP": "ERROR"
                }];
            };
            if($(`.category`).length > 2) {
                $($(`.category`)[1]).after(frlist);
            } else {
                $(`#content`).append(frlist);
            }
        })
        .fail((data) => {
            result = [{
                "user_ID": "ERROR",
                "user_Name": "ERROR",
                "user_PFP": "ERROR"
            }];
        });
    return result;
}
function getExpositions(playlist, type, page = 0) {
    let result = "";
    $.get(`https://api.kulty.app/expo/expolist_${type}.php`, {id: playlist, page})
        .done((data) => {
            if(typeof(data) == "object") {
                result = data;
            } else {
                result = [{
                    "expo_ID": "ERROR",
                    "expo_Name": "ERROR",
                    "expo_Desc": "ERROR", 
                    "expo_DateSt": "ERROR",
                    "expo_DateEd": "ERROR",
                    "muse_Name": "ERROR", 
                    "photos": []
                }];
            };
        })
        .fail((data) => {
            result = [{
                "expo_ID": "ERROR",
                "expo_Name": "ERROR",
                "expo_Desc": "ERROR", 
                "expo_DateSt": "ERROR",
                "expo_DateEd": "ERROR",
                "muse_Name": "ERROR", 
                "photos": []
            }];
        });
    return result;
}
function getTopFeed(user) {
    let result = "";
    $.get("https://api.kulty.app/expo/expolist_today.php", {id: user})
    .done((data) => {
        if(typeof(data) == "object") {
            result = data;
        } else {
            result = [{
                "expo_ID": "ERROR",
                "expo_Name": "ERROR",
                "expo_Desc": "ERROR", 
                "expo_DateSt": "ERROR",
                "expo_DateEd": "ERROR",
                "muse_Name": "ERROR", 
                "photos": []
            }];
        };
    })
    .fail((data) => {
        result = [{
            "expo_ID": "ERROR",
            "expo_Name": "ERROR",
            "expo_Desc": "ERROR", 
            "expo_DateSt": "ERROR",
            "expo_DateEd": "ERROR",
            "muse_Name": "ERROR", 
            "photos": []
        }];
    });
    return result;
}

function placePlaylist(playlist, type) {
    let id = playlist[`${type}_ID`], 
        name = playlist[`${type}_Name`], 
        photo = playlist[`${type}_Photo`];
    $("#category-container").append(`
        <div class="category" id="${type[0]}${id}" data-type="${type}" data-play="${id}">
            <div class="category-title">
                <div class="category-img hasImg" style="background-image: url(&quot;https://cdn.kulty.app/cate/theme/street_art.jpg&quot;);"></div>
                <h2>${name}</h2>
            </div>
            <div class="category-expo-list">
            </div>
        </div>`);
    $(`#${type[0]}${id} .category-img`).css("background-image", `url(https://cdn.kulty.app/${type}/${photo})`);
    if(photo == undefined) {
        $(`#${type[0]}${id} .category-img`).css("background-image", `url(https://cdn.kulty.app/${type}/noimg.jpg)`);
    }
}
function placeFriend(frie) {
    let frieID = frie["user_ID"], 
        frieName = frie["user_Name"], 
        friePFP = frie["user_PFP"];
    if(friePFP == null) {
        friePFP = "default.jpg";
    }
    $("#friend-carousel").append(`
        <div class="friend-icon" id="fl${frieID}">
            <img src="https://cdn.kulty.app/pfp/${friePFP}" class="friend-img hasImg" alt="">
            <div class="friend-name">
                ${frieName}
            </div>
        </div>`);
    $("#friend-expo-list").append(`
        <div class="friend-expo" id="f${frieID}" data-type="frie" data-play="${frieID}">
        </div>`);
    $(`#fl${frieID} .category-title`).css("background-image", `url(https://cdn.kulty.app/pfp/${friePFP})`);
}
function placeExpo(expo, playlist, type) {
    let expoID = expo["expo_ID"], 
        expoName = expo["expo_Name"], 
        [expoYearST, expoMonthST, expoDayST] = expo["expo_DateSt"].split("-"), 
        [expoYearED, expoMonthED, expoDayED] = expo["expo_DateEd"].split("-"), 
        expoDesc = expo["expo_Desc"].slice(0,64)+" ...", 
        expoPhoto = expo["photos"], 
        museName = expo["muse_Name"];
    if(type[0]=="f") {
        $(`#${type[0]}${playlist}`).append(`
            <div class="expo cate-expo hasImg" id="${type[0]}${playlist}-e${expoID}" data-expo="${expoID}">
                <div class="expo-text">
                    <h3>${expoName}</h3>
                    <p>${expoDayST}/${expoMonthST}/${expoYearST.slice(2,4)} - ${expoDayED}/${expoMonthED}/${expoYearED.slice(2,4)}<br>
                    ${museName}</p>
                </div>
                <div class="expo-buttons">
                    <button class="link like"><img src="/assets/icons/icone_filaire_coeur_blanc.svg" alt="J'aime" class="icon-img"></button>
                    <button class="link share"><img src="/assets/icons/icone_filaire_partage_blanc.svg" alt="Partager" class="icon-img"></button>
                    <button class="link loc"><img src="/assets/icons/icone_filaire_lieu_blanc.svg" alt="Y aller" class="icon-img"></button>
                    <button class="link more">Plus d'infos</button>
                </div>
            </div>`);
    } else {
        $(`#${type[0]}${playlist} .category-expo-list`).append(`
            <div class="expo cate-expo hasImg" id="${type[0]}${playlist}-e${expoID}" data-expo="${expoID}">
                <div class="expo-text">
                    <h3>${expoName}</h3>
                    <p>${expoDayST}/${expoMonthST}/${expoYearST.slice(2,4)} - ${expoDayED}/${expoMonthED}/${expoYearED.slice(2,4)}<br>
                    ${museName}</p>
                </div>
                <div class="expo-buttons">
                    <button class="link like"><img src="/assets/icons/icone_filaire_coeur_blanc.svg" alt="J'aime" class="icon-img"></button>
                    <button class="link share"><img src="/assets/icons/icone_filaire_partage_blanc.svg" alt="Partager" class="icon-img"></button>
                    <button class="link loc"><img src="/assets/icons/icone_filaire_lieu_blanc.svg" alt="Y aller" class="icon-img"></button>
                    <button class="link more">Plus d'infos</button>
                </div>
            </div>`);
    }
    let $expo = $(`#${type[0]}${playlist}-e${expoID}`)
    if(expoPhoto[0] == undefined) {
        $expo.css("background-image", `url(https://cdn.kulty.app/expo/noimg.jpg)`);
    } else {
        $expo.css("background-image", `url(https://cdn.kulty.app/expo/${expoPhoto[0]})`);
    }
    if(type[0]=="f") {
        $(`#f${playlist}-e${expoID}`).append(`
            <button class="friend-close">
                <img src="/assets/icons/croix.svg" alt="">
            </button>`);
    }
}
function placeExpoFeed(expo) {
    let expoID = expo["expo_ID"], 
        expoName = expo["expo_Name"], 
        [expoYearST, expoMonthST, expoDayST] = expo["expo_DateSt"].split("-"), 
        [expoYearED, expoMonthED, expoDayED] = expo["expo_DateEd"].split("-"), 
        expoDesc = expo["expo_Desc"].slice(0,64)+" ...", 
        expoPhoto = expo["photos"], 
        museName = expo["muse_Name"];
    $(`#top-expo-list`).append(`
        <div class="top-expo hasImg" id="top-e${expoID}" data-expo="${expoID}">
            <div class="top-expo-text">
                <h3>${expoName}</h3>
                <p>${expoDayST}/${expoMonthST}/${expoYearST.slice(2,4)} - ${expoDayED}/${expoMonthED}/${expoYearED.slice(2,4)}<br>
                ${museName}</p>
            </div>
        </div>`);
    $(`#top-e${expoID}`).css("background-image", `url(https://cdn.kulty.app/expo/${expoPhoto[0]})`);
    if(expoPhoto[0] == undefined) {
        $(`#top-e${expoID}`).css("background-image", `url(https://cdn.kulty.app/expo/noimg.jpg)`);
    }
    if(expoName.length > 24) expoName = expoName.slice(0,24) + "...";
    if(museName.length > 28) museName = museName.slice(0,28) + "...";
    $(`#top-expo-micro-list`).append(`
    <div class="top-expo-micro hasImg" id="top-micro-e${expoID}" data-expo="${expoID}">
        <div class="top-expo-micro-text">
            <h3>${expoName.slice(0,15)+"..."}</h3>
            <p>${museName.slice(0,15)+"..."}</p>
        </div>
        <div class="top-expo-micro-buttons">
            <div class="buttons">
                <button class="link loc"><img src="/assets/icons/icone_plein_lieu_blanc.svg" alt="Y aller" class="icon-img">Y aller</button>
                <button class="link share"><img src="/assets/icons/icone_plein_partage_blanc.svg" alt="Partager" class="icon-img">Partager</button>
            </div>
            <a href="#" class="link more">Plus d'infos ></a>
        </div>
    </div>`);
    $(`#top-micro-e${expoID}`).css("background-image", `url(https://cdn.kulty.app/expo/${expoPhoto[0]})`);
    if(expoPhoto[0] == undefined) {
        $(`#top-micro-e${expoID}`).css("background-image", `url(https://cdn.kulty.app/expo/noimg.jpg)`);
    }
}

function expoLike(user, expo, mode, state = undefined) {
    let result = "";
    $.ajaxSetup({async: false});
    $.get(`https://api.kulty.app/user_info/like/expo_${mode}.php`, {user, expo, state})
        .done((data) => {
            result = data;
        })
        .fail((data) => {
            result = "error";
        });
    console.log(result);
    if(typeof(result) != "boolean") {
        result = false;
    }
    return result;
}
function updateLikeButtons(expo) {
    let $likebutton = $(`.expo[data-expo=${expo}]`).find('.like');
    let doesHeLike = expoLike(user.user_ID, expo, "get");
    if(doesHeLike) {
        $likebutton.removeClass('liked');
        $likebutton.html(`<img src="/assets/icons/icone_plein_coeur_rouge.svg" alt="J'aime" class="icon-img">`)
    } else {
        $likebutton.addClass('liked');
        $likebutton.html(`<img src="/assets/icons/icone_filaire_coeur_blanc.svg" alt="J'aime" class="icon-img">`);
    }

    $likebutton.off('click');
    $likebutton.click(function() {
        expoLike(user.user_ID, expo, "set", !doesHeLike);
        updateLikeButtons(expo);
    });
}

function setButtons() {
    $('.link.share').click( getShare );
    $('.link.loc').click( getLoc );
}
function getShare(e) {
    e.preventDefault();
    let expo = $(this).parents(".expo, .top-expo-micro").data("expo");
    if (navigator.share) {
        navigator.share({
            title: `Titre`,
            text: `Texte`,
            url: `${new URL(window.location.href).origin}/expo?id=${expo}`
        })
        .then(() => console.log('Shared '+ expo))
        .catch((error) => console.error(error));
    }
}
async function getLoc(e) {
    e.preventDefault();
    const $this = $(this);
    const $expo = $this.parents(':eq(2)');
        const expo = $expo.data("expo");
    const link = `https://redirect.kulty.app/loc.php?id=${expo}`;
    const response = await fetch(link);
    const redirect = await response.json();
    if(redirect != false) {
        window.location.href = redirect;
    }
}

function shuffle(oldVersion) {
    let newVersion = Array(oldVersion.length);
    oldVersion.forEach((e) => {
        let i;
        do {
            i = Math.floor(Math.random()*newVersion.length);
        } while( newVersion[i]!=undefined );
        newVersion[i] = e;
    });
    return newVersion;
}

function update() {
    user = getSession();
    if(user.user_ID != 0)
        $(`#welcome`).html(`Bienvenue ${user.user_Name},<br>voici <b>vos sorties du jour</b>`);
    
    let feed = getTopFeed(user.user_ID);
    feed.forEach((element, key) => {
        placeExpoFeed(element);
    });

    let cate = getPlaylist(user.user_ID, "category");
    if(cate.length > 0) {
        cate.forEach((e, k) => {
            cate[k].type = "category";
        });
    }
    let muse = getPlaylist(user.user_ID, "museum");
    if(muse.length > 0) {
        muse.forEach((e, k) => {
            muse[k].type = "museum";
        });
    }
    let play = [...cate, ...muse];
    let playlists = shuffle(play);

    let expos = [];

    playlists.forEach((element, key) => {
        let type = element.type;
        let typ = type.slice(0,4);
        placePlaylist(element, typ);
        let id = element[`${typ}_ID`];
        
        let expo = getExpositions(id, type);
        expo.forEach((element2, key2) => {
            placeExpo(element2, id, typ);
        });
        if(expo.length == 0) {
            $(`#${typ[0]}${id}`).remove();
        }
        expos = [...expos, ...expo];
    });
    if(playlists.length == 0) {
        let element = {};
        element[`cate_ID`] = "0";
        element[`cate_Name`] = "Vous ne suivez aucune playlist";
        element[`cate_Photo`] = undefined;
        placePlaylist(element, "cate");
    }

    let frie = getFriends(user.user_ID);
    if(frie != false) {
        frie.forEach((element, key) => {
            placeFriend(element);
            let frieID = element["user_ID"];

            let expo = getTopFeed(frieID);
            expo.forEach((element2, key2) => {
                placeExpo(element2, frieID, "frie");
                expos = [...expos, ...expo];
            });
            $(`#fl${frieID}`).click(function() {
                activateFriends(this);
            });
        });
    }

    let expolist = [];
    expos.forEach(element => {
        let id = element.expo_ID;
        let free = true;
        expolist.forEach(elmt => {
            if(elmt.expo_ID == id) {
                free = false;
            }
        });
        if(free) {
            expolist = [...expolist, element]
        }
    });
    expolist.forEach(elmt => {
        updateLikeButtons(elmt.expo_ID)
    });
    setButtons();
}

var isScrolling = false;
function getScroll() {
    $($(`.top-expo-micro`)[0]).addClass("topExpoFocus");
    $("#top-expo-list").scroll( function() {
        $(".top-expo-micro").removeClass("topExpoFocus");
        const scrollPos = $("#top-expo-list").scrollLeft();
        const position = Math.round(scrollPos/$(window).width());
        $($(`.top-expo-micro`)[position]).addClass("topExpoFocus");

        const $a = $(".top-expo")[position];
        const exid = $($a).data("expo");

        if(!isScrolling && scrollPos == $(window).width()*position) {
            $("#top-expo-micro-list").animate(
                {scrollLeft: position==0?0:115*index-11}, 
                500, 'swing');
        }
    });
    
    $("#friend-expo-list").scroll(setFocusFrie);


}
function setScroll() {
    $(".top-expo-micro").each( function(index, value) {
        $(value).click( ()=>{
            isScrolling = true;
            $("#top-expo-list").animate(
                {scrollLeft: $(window).width()*index}, 
                500, 'swing', function() { isScrolling = false });
            $("#top-expo-micro-list").animate(
                {scrollLeft: index==0?0:115*index-11}, 
                500, 'swing', function() { isScrolling = false });
        });
    });
}

function setScrollFrie() {
    $(".top-expo-micro").each( function(index, value) {
        $(value).click( ()=>{
            $("#top-expo-list").animate({
                scrollLeft: $(window).width()*index}, 
                500, 'swing');
        });
    });
}

function setFocusFrie() {
    $(".friend-icon").removeClass("frieFocus");
    let position = Math.round($("#friend-expo-list").scrollLeft()/$(window).width());
    let index = $($(`.friend-expo-list .expo`)[position]).parent().attr("id").slice(1);
    $(`#fl${index}`).addClass("frieFocus");
}

function setClick(e) {
    console.log("a")
    e.preventDefault();
    e.stopPropagation();
    if( ! ($(e.target).hasClass("loc") || $(e.target).hasClass("share") || $(e.target).hasClass("expo-buttons") || $(e.target).hasClass("icon-img") || $(e.target).hasClass("friend-close") || $(e.target).parent().hasClass("friend-close")) ) {
        const $this = $(this);
        const type = $this.parent().data("type");
        let play;
        if(type == "feed") {
            play = getSession("session").user_ID;
        } else {
            play = $this.parent().data("play");
        }
        let index;
        if(type == "cate" || type == "muse") {
            index = $this.index()-1;
        } else {
            index = $this.index();
        }
        const expo = $this.data("expo");
        // console.log(type, expo, play, $this.index());
        redirect(expo, type, play, index);
    }
}
function setClick2(e) {
    e.preventDefault();
    e.stopPropagation();
    const $this = $(this).parents(".top-expo-micro");
    const type = "feed";
    const play = getSession("session").user_ID;
    const index = $this.index();
    const expo = $this.data("expo");
    // console.log(type, expo, play, index);
    redirect(expo, type, play, index);
}

function setClick3(e) {
    e.preventDefault();
    e.stopPropagation();
    const $this = $(this).parents(".category");
    const type = $this.data("type");
    const play = $this.data("play");
    sessionStorage.setItem("context"  , "home");
    location.href = `/cate?id=${play}&type=${type}`;
}

function redirect(expo, type, play, index) {
    sessionStorage.setItem("context"  , "home");
    sessionStorage.setItem("viewIndex", index);
    sessionStorage.setItem("viewType" , type);
    sessionStorage.setItem("viewPlay" , play);
    location.href = `/expo?id=${expo}`;
}

// function paralax() {    
//     let documentEl = $(document),
//     parallaxBg = $('.top-expo');
//     let currScrollPos = documentEl.scrollTop();
//     let pos = currScrollPos/2 -50;
//     parallaxBg.css('background-position', `50% ${pos}px`);
// }

function activateFriends(elmt) {
    let $friendlist = $(".friend-list");
    let scroll = $friendlist.offset().top;
    let index = $(elmt).attr('id').slice(2);
    setFocusFrie();
    $("html, body").animate({
        scrollTop: scroll
    }, 300, 'swing');
    setTimeout(() => {
        $("#friend-expo-list").animate({
            scrollLeft: $(`#f${index}`).offset().left}, 
            500, 'swing');
    }, 50);
    $('.friend-expo-list').addClass('show');
    $('.friend-close').click(function() {
        $('.friend-expo-list').removeClass('show');
        $('.friend-icon').removeClass('frieFocus');
    });
}

$(document).ready(() => {
    $.ajaxSetup({async: false});
    update();
    getScroll();
    setScroll();
    $(".top-expo").click(setClick);
    $(".top-expo-micro .more").click(setClick2);
    $(".expo").click(setClick);
    $(".category-title").click(setClick3);
});