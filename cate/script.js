"use strict";

function getSession() {
    let result;
    if(localStorage.getItem("session") != null) {
        result = JSON.parse(localStorage.getItem("session"));
    } else {
        result = {user_ID: 1, user_Name: "default"};
    }
    return result;
}


async function fetch_info(id, type) {
    const infos = await get_info(id, type);
    place_info(infos, type);
}
async function get_info(id, type) {
    const response = await fetch(`https://api.kulty.app/playlist_info/${type}.php?id=${id}`);
    const result = response.json();
    return result;
}
function place_info(info, type) {
    $("#name").text(info.name);
    $(".cate-img").css("background-image", `url("https://cdn.kulty.app/${type}/${info.photo}")`)
}

async function fetch_like_cate(user, id, type) {
    const like = await get_like_cate(user, id, type);
    place_like_cate(like);
}
async function get_like_cate(user, id, type) {
    const response = await fetch(`https://api.kulty.app/user_info/like/${type}_get.php?user=${user}&${type}=${id}`);
    const result = response.json();
    return result;
}
function place_like_cate(like) {
    const $like = $("header .like");
    const $icon = $("header .like .icon");
    if(like) {
        $like.addClass("liked");
        $icon.attr("src", "/assets/icons/icone_plein_coeur_rouge.svg");
    } else {
        $like.removeClass("liked");
        $icon.attr("src", "/assets/icons/icone_filaire_coeur_blanc.svg");
    }
    $like.off();
    $like.click(function() {
        set_like_cate();
    });
}
async function set_like_cate() {
    const user = JSON.parse(localStorage.getItem("session")).user_ID;
    const search = location.search.substring(1);
    const {id, type} = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');

    const doesLike = await get_like_cate(user, id, type);
    const response = await fetch(`https://api.kulty.app/user_info/like/${type}_set.php?user=${user}&${type}=${id}&state=${!doesLike}`);
    let result = await response.json();
    if(result == "exists") result = true;
    place_like_cate(result);
}

async function fetch_expos(id, type) {
    const top10 = await get_expos("top10", id, type);
    const latest = await get_expos("latest", id, type);
    
    if(latest.length > 0) {
        $("main").html(`<section class="top10"><h2 class="top10-title"><span class="t10t-1">top</span><br><span class="t10t-2">10</span><br><span class="t10t-3">expo</span> </h2><div class="top10-content content"></section><section class="latest"><h2 class="latest-title">Toutes les expos</h2><div class="latest-content content"></div></section>`)
        top10.forEach(expo => {
            place_expo(expo, "top10");
        });
        const pattern = [1,2,1,1,2,1,2,1,1];
        let i = 0;
        latest.forEach(expo => {
            place_expo(expo, "latest", pattern[i%9]);
            i++;
        });
    } else {
        $("main").html(`<p>Aucune exposition</p>`);
    }
    $(".expo").click(function(e) {
        if( !($(e.target).hasClass("icon") || $(e.target).hasClass("like")) ) {
            console.log(this);
            const expo = $(this).data("expo");
            redirect(type, expo);
        }
    });
    $(".top10-content").scroll(function() {
        const $this  = $(this);
        const $title = $(".top10-title");
        if($this.scrollLeft() > 80) {
            $title.addClass("mask");
        } else {
            $title.removeClass("mask");
        }
    });
    $(document).on("scroll", function() {
        if($(document).height() - innerHeight -32 < scrollY) {
            $(document).off("scroll");
            fetch_more_expos(id, type, 1);
        }
    });
}
async function fetch_more_expos(id, type, page = 0) {
    const latest = await get_expos("latest", id, type, page);
    if(latest.length > 0) {
        const pattern = [1,2,1,1,2,1,2,1,1];
        let i = 0;
        latest.forEach(expo => {
            place_expo(expo, "latest", pattern[i%9]);
            i++;
        });
    }
    $(".expo").off("click");
    $(".expo").click(function(e) {
        if( !($(e.target).hasClass("icon") || $(e.target).hasClass("like")) ) {
            console.log(this);
            const expo = $(this).data("expo");
            redirect(type, expo);
        }
    });
    $(document).on("scroll", function() {
        console.log(scrollY);
        if($(document).height() - innerHeight -32 < scrollY) {
            $(document).off("scroll");
            fetch_more_expos(id, type, page+1);
        }
    });
}
async function get_expos(section, id, type, page = 0) {
    const response = await fetch(`https://api.kulty.app/discover/${section}_of_playlist.php?type=${type}&play=${id}&page=${page}`);
    const result = await response.json();
    return result;
}
async function place_expo(expo, section, ex = undefined) {
    console.log(expo, section, ex);
    switch (section) {
        case "top10":
            if(expo.name.length > 24) {
                expo.name = expo.name.slice(0,21) + "..."
            }
        break;
        default:
            if(expo.name.length > 18) {
                expo.name = expo.name.slice(0,15) + "..."
            }
        break;
    }
    let url = "";
    if(expo.photo != null) {
        url = `https://cdn.kulty.app/expo/${expo.photo}`;
    } else {
        url = `https://cdn.kulty.app/expo/noimg.jpg`;
    }
    $(`.${section}-content`).append(`<div href="#" class="${section}-expo expo${ex?` ex${ex}`:""}" data-expo="${expo.id}"><img src="${url}" alt="" class="expo-img"><h3 class="expo-title">${expo.name}</h3></div>`);
    if(section == "top10") {
        fetch_like_expo( $(`.${section}-expo[data-expo="${expo.id}"]`) );
    }
}
async function fetch_more_expo(page) {
    $(document).off("scroll");
    if(page == $datapage +1) {
        const response = await fetch(`https://api.kulty.app/discover/latest.php?page=${page}`);
        const expos = await response.json();
        if(expos != false) {
            const pattern = [1,2,1,1,2,1,2,1,1];
            let i = 0;
            expos.forEach(expo => {
                place_discover("latest", expo, "expo", `ex${pattern[i % 9]}`);
                i++;
            });
            $(".latest").data("page", page);
            $(document).on("scroll", function() {
                if($(document).height() - innerHeight - 64 < scrollY) {
                    fetch_more_expo(page+1);
                }
            });
        }
    } else {
        console.error("wrong page");
    }
}


async function fetch_like_expo($expo) {
    const user = JSON.parse(localStorage.getItem("session")).user_ID;
    const expo = $expo.data("expo");
    const like = await get_like_expo(user, expo);
    place_like($expo, like);
}
async function get_like_expo(user, expo) {
    const response = await fetch(`https://api.kulty.app/user_info/like/expo_get.php?user=${user}&expo=${expo}`);
    const result = response.json();
    return result;
}
function place_like($elmt, doesLike) {
    $elmt.children(".like").off().remove();
    $elmt.append(`<button class="like${doesLike?" liked":""}"><img src="/assets/icons/${doesLike?"icone_plein_coeur_rouge":"icone_filaire_coeur_blanc"}.svg" alt="" class="icon"></button>`);
    $elmt.children(".like").click(function() {
        set_like($elmt);
    });
}
async function set_like($elmt) {
    const expo = $elmt.data("expo");
    const user = JSON.parse(localStorage.getItem("session")).user_ID;
    const doesLike = await get_like_expo(user, expo);
    const response = await fetch(`https://api.kulty.app/user_info/like/expo_set.php?user=${user}&expo=${expo}&state=${!doesLike}`);
    let result = await response.json();
    if(result == "exists") result = true;
    place_like($elmt, result);
}


function redirect(type, expo) {
    sessionStorage.setItem("context2", sessionStorage.getItem("context"));
    sessionStorage.setItem("context", "cate");
    sessionStorage.setItem("viewType" , type);
    sessionStorage.setItem("viewPlay" , (new URL(location)).searchParams.get("id"));
    location.href = `/expo?id=${expo}`;
}

// function paralax() {
//     let documentEl = $(document),
//     parallaxBg = $('.cate-img');
//     let currScrollPos = documentEl.scrollTop();

//     const pos = currScrollPos/2;
//     parallaxBg.css('background-position', `50% ${pos}px`);
// }

$(document).ready(function() {
    sessionStorage.getItem("context")=="cate"?
        sessionStorage.setItem("context", sessionStorage.getItem("context2")):
        false;
    const user_info = getSession();
    let search = location.search.substring(1);
    if(search.length == 0) {
        search = "id=0&type=null";
    }
    const {id, type} = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');

    fetch_info(id, type);
    fetch_like_cate(user_info.user_ID, id, type);
    
    fetch_expos(id, type);

    $(".back").click(function(e) {
        e.preventDefault();
        const context = sessionStorage.getItem("context")=="cate"?
                        sessionStorage.getItem("context2"):
                        sessionStorage.getItem("context");
        let newLoc = location.href;
        switch(context) {
            case "home": case "cate":
                newLoc = "/home/";
            break;
            case "search": case "discover":
                newLoc = "/discover/";
            break;
            case "profile":
                const user = sessionStorage.getItem("viewUser");
                newLoc = `/profile/?id=${user}`;
            break;
            default:
                newLoc = `/${context || "home"}/`;
            break;
        }
        location.href = newLoc;
    })

    // paralax();
    // $(document).scroll(() => {
    //     paralax();
    // });
});