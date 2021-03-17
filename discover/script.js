"use strict";
const types = { "expo": "Expositions", "cate": "Catégories", "muse": "Musées", "user": "Utilisateurs/trices" };
let can_fetch = true;

function getSession() {
    let result;
    if(localStorage.getItem("session") != null) {
        result = JSON.parse(localStorage.getItem("session"));
    } else {
        result = {user_ID: 1, user_Name: "default"};
    }
    return result;
}

async function fetch_search(arg) {
    if(can_fetch) {
        can_fetch = false;
        const expos = await get_search("expo", arg);
        const cates = await get_search("cate", arg);
        const muses = await get_search("muse", arg);
        const users = await get_search("user", arg);

        let plays = [];
        for(let i = 0; i < cates.length || i < muses.length; i++) {
            const cate = cates[i], muse = muses[i];
            if(cate)
                plays.push({play: cate, type: "cate"});
            if(muse)
                plays.push({play: muse, type: "muse"});
        }
        $(".search").empty();
        place_search("expo", expos);
        $(".search").append("<hr>");
        place_search("play", plays);
        $(".search").append("<hr>");
        place_search("user", users);
        $(this).parents(".search").removeClass("hasMore");
        $(this).parents(".search-list").removeClass("more");
        $(`.search-list-title`).click(function () {
            console.log($(this).parent().find(".search-elmt").length);
            $(this).parents(".search").toggleClass("hasMore");
            $(this).parents(".search-list").toggleClass("more");
        });
        $(`.search-elmt`).click(function () {
            const type = $(this).data("type");
            const play = $(this).data("play");
            redirect(type, play, "search");
        });
        can_fetch = true;
    }
}
async function get_search(type, arg) {
    const response = await fetch(`https://api.kulty.app/search/${type}.php?arg=${arg}`);
    const result = response.json();
    return result;
}
function place_search(type, list) {
    let type_, is_ok;
    if(type=="play") {
        if(list.length > 0) {
            $(".search").append(`<section class="search-list" data-type="cate"><h2 class="search-list-title">Catégories</h2><div class="search-content"></div></section>`)
            list.forEach(element => {
                let {play, type: type_} = element;
                $(`.search-list[data-type="cate"] .search-content`).append(
                    `<div href="#" class="search-elmt search-cate" data-type="${type_}" data-play="${play[`${type_}_ID`]}">
                        <div class="search-cate-img" style="background-image: url('https://cdn.kulty.app/${type_}/${play[`${type_}_Photo`]==null?"default.jpg":play[`${type_}_Photo`]}?size=96')"></div>
                        <p class="search-title">${play[`${type_}_Name`]}</p>
                    </div>`)
            });
            is_ok = true;
        } else {
            is_ok = false;
        }
    } else {
        if(type=="user") { type_ = "pfp" } else { type_ = type }
        if(list.length > 0) {
            $(".search").append(`<section class="search-list" data-type="${type}"><h2 class="search-list-title">${types[type]}</h2><div class="search-content"></div></section>`)
            list.forEach(element => {
                $(`.search-list[data-type="${type}"] .search-content`).append(
                    `<div href="#" class="search-elmt search-${type}" data-type="${type}" data-play="${element[`${type}_ID`]}">
                        <div class="search-${type}-img" style="background-image: url('https://cdn.kulty.app/${type_}/${element[`${type}_Photo`]==null?"default.jpg":element[`${type}_Photo`]}?size=96')"></div>
                        <p class="search-title">${element[`${type}_Name`]}</p>
                    </div>`)
            });
            is_ok = true;
        } else {
            is_ok = false;
        }
    }
    return is_ok;
}

async function fetch_discover() {
    const top10 = await get_discover("top10");
    const topCate = await get_discover("topCate");
    const topMuse = await get_discover("topMuse");
    const topLatest = await get_discover("latest");
    const latest = topLatest.splice(10);
    top10.forEach(expo => {
        place_discover("top10", expo, "expo");
    });
    let topPlay = [];
    for(let i = 0; i < topCate.length || i < topMuse.length; i++) {
        const cate = topCate[i], muse = topMuse[i];
        if(cate)
            topPlay.push({play: cate, type: "cate"});
        if(muse)
            topPlay.push({play: muse, type: "muse"});
    }
    topPlay.forEach(play => {
        place_discover("topCate", play.play, play.type);
    });
    topLatest.forEach(expo => {
        place_discover("topLatest", expo, "expo");
    });
    $(".latest").data("page", 0);
    const pattern = [1,2,1,1,2,1,2,1,1];
    let i = 0;
    latest.forEach(expo => {
        place_discover("latest", expo, "expo", `ex${pattern[i % 9]}`);
        i++;
    });
    $(document).on("scroll", function() {
        if($(document).height() - innerHeight -32 < scrollY) {
            fetch_more_expo(1);
        }
    });
}
async function get_discover(section) {
    const response = await fetch(`https://api.kulty.app/discover/${section}.php`);
    const result = response.json();
    return result;
}
async function place_discover(section, elmt, type, model = "") {
    switch (section) {
        case "top10":
            if(elmt.name.length > 24) {
                elmt.name = elmt.name.slice(0,21) + "..."
            }
        break;
        case "topCate":
            if(elmt.name.length > 20) {
                elmt.name = elmt.name.slice(0,17) + "..."
            }
        break;
        default:
            if(elmt.name.length > 18) {
                elmt.name = elmt.name.slice(0,15) + "..."
            }
        break;
    }
    let section_;
    if(section == "topLatest") section_ = "latest"; else section_ = section;
    let url = "";
    if(elmt.photo != null) {
        url = `https://cdn.kulty.app/${type}/${elmt.photo}?size=225`;
    } else {
        url = `https://cdn.kulty.app/expo/noimg.jpg?size=225`;
    }
    $(`.${section}-content`).append(`<div href="#" class="${section}-expo expo ${model}" data-type="${type}" data-play="${elmt.id}" data-section="${section_}">
    <img src="${url}" alt="" class="expo-img">
    <h3 class="expo-title">${elmt.name}</h3>
    <button class="like">
    </div>`);
    await fetch_like($(`.${section}-expo[data-type="${type}"][data-play="${elmt.id}"]`));
    $(`.${section}-expo[data-type="${type}"][data-play="${elmt.id}"]`).on("click", ":not(.like), :not(.like .icon)", function(e) {
        e.stopPropagation();
        if( ! ($(this).hasClass("like") || $(this).hasClass("icon")) ) {
            const $this = $(this).parents(".expo");
            const type = $this.data("type");
            const play = $this.data("play");
            // console.log(type, play, section);
            redirect(type, play, "discover");
        }
    });
}

async function fetch_more_expo(page) {
    $(document).off("scroll");
    const $datapage = $(".latest").data("page");
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

async function set_like($elmt) {
    const type = $elmt.data("type");
    const play = $elmt.data("play");
    const user = JSON.parse(localStorage.getItem("session")).user_ID;
    const doesLike = await get_like(type, play);
    const response = await fetch(`https://api.kulty.app/user_info/like/${type}_set.php?user=${user}&${type}=${play}&state=${!doesLike}`);
    let result = await response.json();
    if(result == "exists") result = true;
    place_like(type, play, result);
}
async function fetch_like($elmt) {
    const type = $elmt.data("type");
    const play = $elmt.data("play");
    const like = await get_like(type, play);
    place_like(type, play, like);
}
async function get_like(type, play) {
    const user = getSession().user_ID;
    const response = await fetch(`https://api.kulty.app/user_info/like/${type}_get.php?user=${user}&${type}=${play}`);
    const result = response.json();
    return result;
}
function place_like(type, play, doesLike) {
    const $all = $(`.expo[data-type="${type}"][data-play="${play}"]`);
    $all.each(function() {
        const $elmt = $(this);
        $elmt.children(".like").off();
        if(doesLike) {
            $elmt.children(".like").addClass("liked");
        } else {
            $elmt.children(".like").removeClass("liked");
        }
        $elmt.children(".like").html(`<img src="/assets/icons/${doesLike?"icone_plein_coeur_rouge":"icone_filaire_coeur_blanc"}.svg" alt="" class="icon">`);
        $elmt.children(".like").click(function() {
            set_like($elmt);
        });
    })
}

function redirect(type, play, context) {
    sessionStorage.setItem("query", $("#search").val());
    sessionStorage.setItem("context", context);
    let newLoc = location.href;
    switch(type) {
        case "expo":
            newLoc = `/expo?id=${play}`;
        break
        case "cate":
            newLoc = `/cate?id=${play}&type=cate`;
        break
        case "muse":
            newLoc = `/cate?id=${play}&type=muse`;
        break
        case "user":
            newLoc = `/profile?id=${play}`;
        break
    }
    location.href = newLoc;
}

function update(e) {
    const $this = $(this);
    const val = $this.val();
    if(val.length > 0) {
        $(".search").removeClass("hide");
        $(".discover").addClass("hide");
        $(".bottom-bar").addClass("hide");
        fetch_search(val);
    } else {
        $(".search").addClass("hide");
        $(".discover").removeClass("hide");
        $(".bottom-bar").removeClass("hide");
    }
}

$(document).ready(function() {
    fetch_discover();
    $("#search").change( update );
    let time = new Date().getTime();
    $("#search").keydown(function() {
        const $this = $(this);
        time = new Date().getTime();
        const inte = setInterval(function() {
            if( (new Date()).getTime() - time > 500 ) {
                $this.trigger("change");
                clearInterval(inte);
            }
        }, 100);
    });

    if( sessionStorage.getItem("query") ) {
        $("#search").val(sessionStorage.getItem("query")).trigger("change");
        sessionStorage.removeItem("query");
    }

    $(".top10-content").scroll(function() {
        const $this  = $(this);
        const $title = $(".top10-title");
        if($this.scrollLeft() > 80) {
            $title.addClass("mask");
        } else {
            $title.removeClass("mask");
        }
    })
});