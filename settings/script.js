"use strict";

$(document).ready(function() {
    const user = get_session();
    let changes = false;
    fetch_user(user.user_ID);

    swapTo();
    
    $("#unlog").click(function() {
        localStorage.removeItem("session");
        window.location.href = "/login";
    });
    $(".goto-href").click(function(e) {
        e.preventDefault();
        console.log($(this).attr("href"));
        if(changes) {
            if(confirm("Les modifications effectuées ne seront pas sauvegardées. Voulez vous continuer?")) {
                location.hash = "menu";
                location.reload();
            }
        } else {
            swapTo($(this).attr("href"));
        }
    });
    let is_sending = false;
    $("#l-valid").click(async function(e) {
        e.preventDefault();
        if(!is_sending) {
            $("#l-valid").text("Envoi...");
            const con = await send_image(user.user_Name, $("#pfp")[0].files[0]);
            $("#l-valid").text("Valider");
            if(con.state) {
                changes = false;
                location.hash = "menu";
                location.reload();
            } else {
                alert(con.error);
            }
        }
    })
    $("#new-pass").parents(".field").click(function(e) {
        e.preventDefault();
        location.href = "/settings/newpass";
    })
    $("#pfp").change(function(e) {
        const image_url = window.URL.createObjectURL(e.target.files[0]);
        $("#l-pfp").attr("src", image_url);
        changes = true;
        $("#l-valid").attr("disabled", false);
    });
    $("l-pfp").click(function(e) {
        $("#pfp").trigger("click");
    })
    sessionStorage.setItem("gotTosFrom", "settings");
})

function swapTo(hash = location.hash) {
    if(hash == "") {
        hash = "#menu";
    }
    $("main").css("display", "none");
    $(hash).css("display", "");
    location.hash = hash;
    // window.scrollY = 0;
}

function get_session() {
    let result;
    if(localStorage.getItem("session") != null) {
        result = JSON.parse(localStorage.getItem("session"));
    } else {
        location.href = "/login";
    }
    return result;
}

async function fetch_user(user) {
    const infos = await get_user_infos(user);
    place_user_infos(infos);
    console.log(infos)
}
async function get_user_infos(user) {
    const response = await fetch(`https://api.kulty.app/user_log/get_infos.php?id=${user}`);
    const expos = await response.json();
    return expos;
}

function place_user_infos({user_Name, user_PFP, user_Email}) {
    let is_masked = true;
    const masked_mail = maskMail(user_Email);
    $("#l-name").html(user_Name);
    $("#l-pfp").attr("src", `https://cdn.kulty.app/pfp/${user_PFP ? user_PFP : "default.jpg"}?size=135`);
    $("#l-mail").html(masked_mail);
    $("#l-mail").parents(".field").click(function(e) {
        e.preventDefault();
        $("#l-mail").html(is_masked?user_Email:masked_mail);
        is_masked = !is_masked;
    })
}

async function send_image(user, file) {
    let jform = new FormData();
    jform.append('name', user);
    jform.append('image', file);

    const response = await $.ajax({
        url: `https://api.kulty.app/user_log/set_pfp.php`,
        type: 'POST',
        data: jform,
        dataType: 'json',
        mimeType: 'multipart/form-data', // this too
        contentType: false,
        cache: false,
        processData: false
    }).promise();
    
    return response;
}


function maskMail(oldMail) {
    let newMail = "";
    let doWeDoThis = true;
    for(let i in oldMail) {
        const letter = oldMail[i];
        if(letter != "@" && doWeDoThis == true) {
            newMail += "*";
        } else {
            newMail += letter;
            doWeDoThis = false;
        }
    }
    return newMail;
}
