"use strict";

function getSession() {
    let result;
    if(localStorage.getItem("session") != null || localStorage.getItem("isVisitor") == true) {
        result = JSON.parse(localStorage.getItem("session"));
    } else {
        result = {user_ID: 1, user_Name: "visiteur"};
        localStorage.setItem("isVisitor", true);
        localStorage.setItem("session", JSON.stringify(result));
    }
    return result;
}

function writeDate(data) {
    let date = new Date(data);
    let day = (date.getDate()).toString();
    while(day.length < 2) day = "0"+day;
    let month = (date.getMonth()+1).toString();
    while(month.length < 2) month = "0"+month;
    let year = date.getFullYear().toString().slice(2,4);
    return day+"/"+month+"/"+year;
}

function getUserInfo(user) {
    let result = "";
    $.ajaxSetup({async: false});
    $.get("https://api.kulty.app/expo/view_expo.php", {id: user})
        .done((data) => {
            if(typeof(data) == "object") {
                result = data;
                result["expo_DateSt"] = writeDate(result["expo_DateSt"]);
                result["expo_DateEd"] = writeDate(result["expo_DateEd"]);
                result["expo_Desc"] = result["expo_Desc"];
            } else {
                result = {
                    "expo_Name": "ERROR",
                    "expo_Desc": "ERROR",
                    "expo_DateSt": "ERROR",
                    "expo_DateEd": "ERROR",
                    "muse_Name": "ERROR",
                    "muse_Addr": "ERROR",
                //  "categories": [],
                    "photos": ["noimg.jpg"]
                };
            };
        })
        .fail((data) => {
            console.log(data);
            result = {
                "expo_Name": "ERROR",
                "expo_Desc": "ERROR",
                "expo_DateSt": "ERROR",
                "expo_DateEd": "ERROR",
                "muse_Name": "ERROR",
                "muse_Addr": "ERROR",
            //  "categories": [],
                "photos": ["noimg.jpg"]
            };
        });
    return result;
}

function update() {
    let values = getUserInfo( id );

    $("#name").text(values["expo_Name"]);
    let desc = values["expo_Desc"]; 
        let lilDesc = slicehtml(desc, 100, `... <span id="more" class="more">Lire plus</span>`);
        $("#desc").html(lilDesc);
        $("#more").click(function() {
            $("#desc").html(desc);
            $("#more").remove();
            $(".expo").css({"max-height": "none" , "overflow": "auto"});
        });
        $("body").on("scrolldown", function() {
            $("#desc").html(desc);
            $("#more").remove();
        })
    $("#dateSt").text(values["expo_DateSt"].replace(/-/g,"/"));
    $("#dateEd").text(values["expo_DateEd"].replace(/-/g,"/"));
    $("#muse").text(values["muse_Name"]);
    $("#loc").text(values["muse_Addr"]);
    let i = 0;
    for(let pic of values["photos"]) {
        $("#images").append(`<div class="img" id="img-${i}"></div>`);
        $(`#img-${i}`).css("background-image", `url(https://cdn.kulty.app/expo/${pic}?size=${window.innerWidth})`);
        $("#dots").append(`<div class="dot" id="dot-${i}"></div>`);
        i++;
    }
    if(values["photos"].length == 0) {
        $("#images").append(`<div class="img" id="img-0"></div>`);
        $(`#img-0`).css("background-image", `url(https://cdn.kulty.app/expo/noimg.jpg?size=${window.innerWidth})`);
        $("#dots").append(`<div class="dot" id="dot-0"></div>`);
    }
    $("#header").css("background-image", `url("https://cdn.kulty.app/expo/${values["photos"][0]}?size=${window.innerWidth}")`);
    updateDots();
    load_end();
}

// function scrollParalax() {
//     let currScrollPos = $(document).scrollTop();
//     $(".img").css('background-position', '50%' + currScrollPos/2 + 'px');
// }
function updateDots() {
    let imagesPosition = Math.round($("#images").scrollLeft()/$("#images").width());
    $(`.dot`).removeClass("selected");
    $(`#dot-${imagesPosition}`).addClass("selected");
}

function expoLike(user, mode, state = undefined) {
    let result = "";
    $.ajaxSetup({async: false});
    $.get(`https://api.kulty.app/user_info/like/expo_${mode}.php`, {user, expo: id, state})
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
    let $likebutton = $(`.like`);
    let user = getSession();
    let doesHeLike = expoLike(user.user_ID, "get");
    if(doesHeLike) {
        $likebutton.addClass('liked');
    } else {
        $likebutton.removeClass('liked');
    }

    $likebutton.off('click');
    $likebutton.click(function() {
        expoLike(user.user_ID, "set", !doesHeLike);
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
    const link = $(this).attr('href');
    const response = await fetch(link);
    const redirect = await response.json();
    if(redirect != false) {
        window.location.href = redirect;
    }
}

function setSwipers() {
    $(".expo-links").on("swipeup", swipeUp );
    $(".header").on("swipedown", swipeDown );
}

async function swipeUp() {
    if( sessionStorage.context == "home" ) {
        const index = sessionStorage.viewIndex;
        const type = sessionStorage.viewType;
        const play = sessionStorage.viewPlay;
        const link = `https://redirect.kulty.app/next_expo.php?index=${index}&type=${type}&play=${play}`;
        const response = await fetch(link);
        const redirect = await response.json();
        console.log(link);
        if(redirect!=false) {
            sessionStorage.viewIndex = JSON.parse(sessionStorage.viewIndex)+1;
            window.location = `/expo?id=${redirect}`;
        }
    }
}
async function swipeDown() {
    console.log("down")
    if( sessionStorage.context == "home" ) {
        const index = sessionStorage.viewIndex;
        const type = sessionStorage.viewType;
        const play = sessionStorage.viewPlay;
        const link = `https://redirect.kulty.app/prev_expo.php?index=${index}&type=${type}&play=${play}`;
        const response = await fetch(link);
        const redirect = await response.json();
        console.log(link);
        if(redirect!=false) {
            sessionStorage.viewIndex = JSON.parse(sessionStorage.viewIndex)-1;
            window.location = `/expo?id=${redirect}`;
        }
    }
}

var id = window.location.search.slice(1).split("=")[1];
$(".link.loc").attr('href', `https://redirect.kulty.app/loc.php?id=${id}`);

$(document).ready(function() {

    update();
    updateLikeButtons();
    setButtons();
    setSwipers();

    // $(document).on('scroll', function() {
    //     scrollParalax();
    // });
    
    $("#images").on("scroll", function() {
        updateDots();
    });

    $(".back").click(function(e) {
        e.preventDefault();
        const context = sessionStorage.getItem("context");
        let newLoc = location.href;
        switch(context) {
            case "home":
                newLoc = "/home/";
            break;
            case "search":
                newLoc = "/discover/";
            break;
            case "discover":
                newLoc = "/discover/";
            break;
            case "profile":
                const user = sessionStorage.getItem("viewUser");
                newLoc = `/profile/?id=${user}`;
            break;
            case "cate":
                const type = sessionStorage.getItem("viewType");
                const play = sessionStorage.getItem("viewPlay");
                newLoc = `/cate/?id=${play}&type=${type}`;
            break;
            default:
                newLoc = `/${context}/`;
            break;
        }
        location.href = newLoc;
    })
});

function slicehtml(text, maxslice, end) {
    let expectTag = false, closingTag = false, tagList = [], lastTag = "", expectLastTag = "";
    let lastBracketPos = 0;
    let i = 0;
    for(const letter of text) {
        switch(letter) {
            case "<":
                expectTag = true;
                lastTag = "";
                lastBracketPos = i;
            break;
            case ">":
                if(expectTag) {
                    if(closingTag) {
                        if(expectLastTag == lastTag) {
                            tagList.splice(-1);
                        }
                    } else {
                        tagList.push({
                            tag: lastTag,
                            pos: i-lastTag.length-1
                        });
                    }
                    expectTag = false;
                }
            break;
            case "/":
                if(expectTag) {
                    closingTag = true;
                }
            break;
            default:
                if(expectTag) {
                    lastTag += letter;
                } else {
                    lastBracketPos = i;
                }
                if(closingTag) {
                    expectLastTag += letter;
                }
            break;
        }
        i++;
        if(i == maxslice) {
            break;
        }
    }
    let newText = "";
    if(tagList.length > 0) {
        newText = text.slice(0, lastBracketPos)+end;
        let endTXT = "";
        tagList.forEach(tag => {
            endTXT = `</${tag.tag}>` + endTXT;
        });
        newText += endTXT;
    } else {
        newText = text.slice(0, maxslice)+end;
    }
    return newText;
}