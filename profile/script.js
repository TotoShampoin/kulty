"use strict";

function get_session() {
    let result;
    if(localStorage.getItem("session") != null) {
        result = JSON.parse(localStorage.getItem("session"));
    } else {
        result = {user_ID: 1, user_Name: "default"};
    }
    sessionStorage.removeItem("viewType");
    sessionStorage.removeItem("viewPlay");
    sessionStorage.removeItem("viewIndex");
    return result;
}

async function fetch_user(user) {
    const infos = await get_user_infos(user);
    const bgpic = await get_last_expo_pic(user);
    place_user_infos(infos);
    place_background(bgpic)
}
async function get_user_infos(user) {
    const response = await fetch(`https://api.kulty.app/user_info/profile.php?id=${user}`)
    const expos = await response.json();
    return expos;
}
function place_user_infos({user_Name, user_PFP, followers, following, liked_expos}) {
    const user = window.location.search.slice(1).split("=")[1];
    const session = get_session().user_ID;
    $("#user_name").html(user_Name);
    $("#user_pic").attr("src", `https://cdn.kulty.app/pfp/${user_PFP ? user_PFP : "default.jpg"}?size=68`);
    $("#expo-counter .counter").html(liked_expos);
    $("#subbed-counter .counter").html(followers);
    $("#subs-counter .counter").html(following);
    if(user == session || user == undefined) {
        $("#user_pic").css("border", "#f008 3px solid");
        $("#user_like").remove();
        $(".back").remove();
    } else {
        $(".settings").remove();
        $(".bottom-bar").addClass("hide")
    };
}

async function fetch_expos(user, type, date) {
    $(document).off("scroll");
    $(".expo").off("click");
    $(".link.log").off("click");
    $('.main').empty();
    const expos = await get_expos(user, type, date, 0);
    if(expos) {
        const pattern = [1,2,1,1,2,1,2,1,1];
        let i = 0;
        expos.forEach(expo => {
            place_expo(expo, type, pattern[i%9]);
            i++;
        });
        $('.link.loc').click( getLoc );
    } else {
        $('.main').append('<p>Aucune exposition</p>');
    }
    $(".expo").click(setClick);
    $(document).on("scroll", function() {
        paralax();
        if($(document).height() - innerHeight - 64 < scrollY) {
            fetch_more_expos(user, type, date, 1);
        }
    });
}
async function fetch_more_expos(user, type, date, page = 0) {
    $(document).off("scroll");
    $(".expo").off("click");
    $(".link.log").off("click");
    const expos = await get_expos(user, type, date, page);
    console.log(expos)
    if(expos) {
        const pattern = [1,2,1,1,2,1,2,1,1];
        let i = 0;
        expos.forEach(expo => {
            place_expo(expo, type, pattern[i%9]);
            i++;
        });
        $('.link.loc').click( getLoc );
    }
    $(".expo").click(setClick);
    $(document).on("scroll", function() {
        paralax();
        if($(document).height() - innerHeight - 64 < scrollY) {
            fetch_more_expos(user, type, date, page+1);
        }
    });
}
async function get_expos(user, type, date = new Date(), page = 0) {
    let api = "";
    date = date.toISOString().split('T')[0];
    if(type == "#cal") {
        api = `https://api.kulty.app/user_info/expo_list_day.php?id=${user}&date=${date}&page=${page}`
    } else {
        api = `https://api.kulty.app/user_info/expo_list.php?id=${user}&page=${page}`;
    }
    const response = await fetch(api);
    const infos = await response.json();
    return infos;
}
function place_expo({expo_ID, expo_Name, muse_Name, photo}, type, isLong) {
    if(type == "#cal") {
        if(expo_Name.length > 32) {
            expo_Name = expo_Name.slice(0,29) + "..."
        }
        $('.main').append(
            `<div class="expo expo-long" data-expo="${expo_ID}">
            <img class="expoimg" src="https://cdn.kulty.app/expo/${photo}?size=${Math.floor(window.innerWidth*.90)}" alt="">
                <div class="long-text">
                    <h3>${expo_Name}</h3>
                    <p>${muse_Name}</p>
                </div>
                <a href="#" class="link loc"><img src="/assets/icons/icone_plein_lieu_blanc.svg" alt="Y aller" class="icon-img">Y aller</a>
            </div>`
        );
    } else {
        if(expo_Name.length > 24) {
            expo_Name = expo_Name.slice(0,21) + "..."
        }
        $('.main').append(
            `<div class="expo expo${isLong}" data-expo="${expo_ID}">
                <img class="expoimg" src="https://cdn.kulty.app/expo/${photo}?size=110" alt="">
                <p class="expo-p">${expo_Name}</p>
            </div>`
        );
    }
}
async function getLoc(e) {
    e.preventDefault();
    const $this = $(this);
    const $expo = $this.parent();
        const expo = $expo.data("expo");
    console.log($expo, expo);
    const link = `https://redirect.kulty.app/loc.php?id=${expo}`;
    const response = await fetch(link);
    const redirect = await response.json();
    if(redirect != false) {
        window.location.href = redirect;
    }
}

async function get_last_expo_pic(user) {
    const response = await fetch(`https://api.kulty.app/user_info/last_expo_pic.php?id=${user}`);
    const photo = await response.json();
    if(photo.length == 0) {
        return false;
    } else {
        return photo[0].photo_URL;
    }
}
function place_background(photo) {
    if(photo) {
        $(".head-name").css("background-image", `url("https://cdn.kulty.app/expo/${photo}?size=${window.innerWidth}")`);
    } else {
        $(".head-name").css("background-image", `url("https://cdn.kulty.app/expo/noimg.jpg?size=${window.innerWidth}")`);
    }
}

function update_type(type) {
    if(type == "#cal") {
        $('.head-calendar').removeClass("hide");
        $('.main').removeClass('grid').addClass('expo-list');
        $('.nav-button[data-type="expo"]').removeClass('selected');
        $('.nav-button[data-type="cal"]').addClass('selected');
        let date = new Date();
        set_calendar(date, date);
    } else {
        $('.head-calendar').addClass("hide");
        $('.main').removeClass('expo-list').addClass('grid');
        $('.nav-button[data-type="cal"]').removeClass('selected');
        $('.nav-button[data-type="expo"]').addClass('selected');
    }
}
function set_calendar(date, today) {
    let user = window.location.search.slice(1).split("=")[1];
    let type = window.location.hash;
    const dates = get_dates_of_week(date);
    const month = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    $(`#cal-days`).empty();
    dates.forEach(day => {
        $(`#cal-days`).append(`<div class="daynum" data-date="${day.toISOString().split('T')[0]}">${day.getDate()}</div>`);
    });
    $(`#month`).html(month[date.getMonth()]);
    $(`.daynum`).removeClass('focus');
    $(`.daynum[data-date="${today.toISOString().split('T')[0]}"]`).addClass('focus');
    $(`.daynum`).click(function() {
        let $this = $(this);
        let newDate = new Date($this.data("date"));
        fetch_expos(user, type, newDate);
        set_calendar(date, newDate);
    });

    $('.head-calendar').off();
    $('.head-calendar').on("swipeleft", function() { swipe_calendar("left") });
    $('.head-calendar').on("swiperight", function() { swipe_calendar("right") });
    
    function swipe_calendar(side) {
        let newDate = new Date(date);
        switch (side) {
            case "left":
                newDate.setDate(newDate.getDate()+7);
                set_calendar(newDate, today);
            break;
            case "right":
                newDate.setDate(newDate.getDate()-7);
                set_calendar(newDate, today);
            break;
        }
    }
}
function get_dates_of_week(current) {
    let week= new Array(); 
    let newCurrent = new Date(current.toISOString());
    newCurrent.setDate((newCurrent.getDate() - newCurrent.getDay() +1));
    for (let i = 0; i < 7; i++) {
        week.push(
            new Date(newCurrent)
        ); 
        newCurrent.setDate(newCurrent.getDate() +1);
    }
    return week; 
}

async function fetch_like(user, id) {
    const like = await get_like(user, id);
    place_like(like);
}
async function get_like(user, folo) {
    const response = await fetch(`https://api.kulty.app/user_info/like/user_get.php?user=${user}&folo=${folo}`);
    const result = response.json();
    return result;
}
function place_like(like) {
    const $like = $(".add");
    const $icon = $(".add img");
    if(like) {
        $like.addClass("added");
        $icon.attr("src", "/assets/icons/minus.svg");
    } else {
        $like.removeClass("added");
        $icon.attr("src", "/assets/icons/plus.svg");
    }
    $like.off();
    $like.click(function() {
        set_like();
    });
}
async function set_like() {
    const user = JSON.parse(localStorage.getItem("session")).user_ID;
    const search = location.search.substring(1);
    const {id} = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');

    const doesLike = await get_like(user, id);
    const response = await fetch(`https://api.kulty.app/user_info/like/user_set.php?user=${user}&folo=${id}&state=${!doesLike}`);
    let result = await response.json();
    if(result == "exists") result = true;
    place_like(result);
    fetch_user(id);
}

// function paralax() {
//     let documentEl = $(document),
//     parallaxBg = $('.head-name');
//     let currScrollPos = documentEl.scrollTop();
//     let pos = currScrollPos/2;
//     parallaxBg.css('background-position', `50% ${pos}px`);
// }
// $(document).ready(function () {
//     $(window).bind('scroll', function () {
//         var navHeight = $(window).height() - 635;
//         if ($(window).scrollTop() > navHeight) {
//             $('#wrap').addClass('fixed');
//             $(".fixed header .head-name").css("background-position", "50% -44px !important");
//         } else {
//             $('#wrap').removeClass('fixed');
//         }
//     });
// });
function get_dates_of_week(current) {
    let week= new Array(); 
    let newCurrent = new Date(current.toISOString());
    newCurrent.setDate((newCurrent.getDate() - newCurrent.getDay() +1));
    for (let i = 0; i < 7; i++) {
        week.push(
            new Date(newCurrent)
        ); 
        newCurrent.setDate(newCurrent.getDate() +1);
    }
    return week; 
}

function paralax() {
    let documentEl = $(document),
    parallaxBg = $('.head-name');
    let currScrollPos = documentEl.scrollTop();

    
    const idealtop = .96*$(window).height() - 26*rem();
    $("header").css("--ideal-top", `-${idealtop}px`);

    if(currScrollPos > idealtop) {
        const hname = $('.head-name').height();
        const hhead = $('.head-header').height();
        const head = hname + hhead;
        $('header').addClass('fix');
        $('.expolist').css('padding-top', head);

        // parallaxBg.css('background-position', `50% ${345/2}px`);
    } else {
        $('header').removeClass('fix');
        $('.expolist').css('padding-top', 0 );
        // const pos = currScrollPos/2;
        // parallaxBg.css('background-position', `50% ${pos}px`);
    }
}

function setClick(e) {
    e.stopPropagation();
    if( ! ($(e.target).hasClass("link")) ) {
        redirect($(this).data("expo"));
    }
}
function redirect(expo) {
    sessionStorage.setItem("context"  , "profile");
    sessionStorage.setItem("viewUser" , window.location.search.slice(1).split("=")[1]);
    location.href = `/expo?id=${expo}`;
}


$(document).ready(function() {
    let user = window.location.search.slice(1).split("=")[1];
    let session = get_session();
    if(user == undefined) {
        user = session.user_ID;
        window.location.search = `?id=${user}`;
    }
    let type = window.location.hash;
    let date = new Date();

    fetch_user(user);
    fetch_expos(user, type, date);
    update_type(type);
    fetch_like(session.user_ID, user);

    paralax();
    
    $(".nav-button").click(function() {
        window.scrollTo(0,0);
        paralax();
        type = `#${$(this).data("type")}`;
        window.location.hash = type;
        fetch_expos(user, type, date);
        update_type(type);
    });

    $(".back").click(function(e) {
        e.preventDefault();
        window.location.href = "/discover/";
    })
    load_end();
});

function rem() {
    return parseInt($("body").css("font-size"));
}