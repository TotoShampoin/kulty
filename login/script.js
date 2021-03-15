"use strict";

$(document).ready(function () {
    localStorage.removeItem("session");
    if(document.location.hash == "") {
        document.location.hash = "main";
    }
    updateMenu();
    $("a").click(function() {
        document.location.hash = $(this).attr("href");
        updateMenu();
    });
    $("input").each(function() {
        this.oninput = e => {
            e.target.setCustomValidity("");
        }
    })
    $( "#log form").submit(login);
    $("#sign form").submit(signup);
    $("#mail form").submit(sendmail);
    
    sessionStorage.setItem("gotTosFrom", "login#sign");
});

function updateMenu() {
    $("main").css("display", "none");
    $(`${document.location.hash}`).css("display", "");
}


async function login(e) {
    e.preventDefault();
    const log  = $("#l-login").val();
    const pass = $("#l-pass" ).val();

    const con = await post("https://api.kulty.app/user_log/connect_user.php", { name: log, pass: pass });
    if( con.state ) {
        if( setSession(con.id, log) ) {
            window.location.href = "/home";
        }
    }
    console.log(con);
}
async function signup(e) {
    e.preventDefault();
    const log   = $("#s-login").val();
    const mail  = $("#s-mail" ).val();
    const age   = $("#s-age"  ).val();
    const pass  = $("#s-pass" ).val();
    const pass2 = $("#s-pass2").val();
    const tos   = $("#s-tos"  ).prop("checked");

    const isLogOk   = await isLoginAvailable(log, mail);
    const isPassOk  = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(pass);
    const isPass2Ok = pass == pass2;
    const isAgeOk   = age >= 16;
    const isTosOk   = tos;
    if( isLogOk && isPassOk && isPass2Ok && isAgeOk && isTosOk ) {
        const con = await post("https://api.kulty.app/user_log/create_user.php", { name: log, mail, pass, age });
        if( con.state ) {
            if( setSession(con.id, log) ) {
                window.location.href = "/home";
            } else {
                alert("session error");
            }
        } else {
            alert(con);
        }
        console.log(con);
    } else {
        if(!isLogOk) {
            $("#s-mail")[0].setCustomValidity("L'identifiant ou l'email figure déjà dans nos bases de données");
            $("#s-mail")[0].reportValidity();
        }
        if(!isPassOk) {
            $("#s-pass")[0].setCustomValidity("Le mot de passe doit contenir au minimum 8 caractères dont une lettre majuscule, une minuscule, un chiffre et un caractère spécial");
            $("#s-pass")[0].reportValidity();
        }
        if(!isPass2Ok) {
            $("#s-pass2")[0].setCustomValidity("Les deux mots de passes ne correspondent pas");
            $("#s-pass2")[0].reportValidity();
        }
        if(!isAgeOk) {
            $("#s-age")[0].setCustomValidity("Vous devez avoir plus de 16 ans pour utiliser Kulty");
            $("#s-age")[0].reportValidity();
        }
        if(!isTosOk) {
            $("#s-tos")[0].setCustomValidity("Vous devez accepter nos conditions d'utilisation pour utiliser Kulty");
            $("#s-tos")[0].reportValidity();
        }
    }
}
async function sendmail(e) {
    e.preventDefault();
    const mail = $("#m-mail").val();
    const con = await post("https://api.kulty.app/user_log/reset_pass.php", {mail});
    if(con.state) {
        document.location.hash = "#mail2";
        updateMenu();
    }
}


function setSession(id, name) {
    try {
        localStorage.setItem("session", JSON.stringify({user_ID: id, user_Name: name}));
        return true;
    } catch(e) {
        return false;
    }
}

async function isLoginAvailable(log, mail) {
    return await get("https://api.kulty.app/user_log/check_username.php", {name: log, mail: mail});
}

async function post(url, data) {
    return await $.post(url, data).promise();
}

async function get(url, data) {
    return await $.get(url, data).promise();
}
