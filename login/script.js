"use strict";

$(document).ready(function () {
    if( sessionStorage.getItem("signform") ) {
        const { log, mail, age, pass, pass2, tos } = JSON.parse(sessionStorage.getItem("signform"));
        $("#s-login").val(log);
        $("#s-mail" ).val(mail);
        $("#s-age"  ).val(age);
        $("#s-pass" ).val(pass);
        $("#s-pass2").val(pass2);
        $("#s-tos"  ).prop("checked", tos);
        sessionStorage.removeItem("signform");
    }
    localStorage.removeItem("session");
    if(document.location.hash == "") {
        document.location.hash = "main";
    }
    updateMenu();
    $("a.a").click(function() {
        document.location.hash = $(this).attr("href");
        updateMenu();
    });
    $("a.out").click(function(e) {
        e.preventDefault();
        const log   = $("#s-login").val();
        const mail  = $("#s-mail" ).val();
        const age   = $("#s-age"  ).val();
        const pass  = $("#s-pass" ).val();
        const pass2 = $("#s-pass2").val();
        const tos   = $("#s-tos"  ).prop("checked");
        sessionStorage.setItem("signform", JSON.stringify({ log, mail, age, pass, pass2, tos }));
        location = $(this).attr("href");
    })
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
    } else {
        alert("Le login ou mot de passe est incorrect");
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
            alert("L'identifiant ou l'email figure déjà dans nos bases de données");
        }
        if(!isPassOk) {
            $("#s-pass")[0].setCustomValidity("Le mot de passe doit contenir au minimum 8 caractères dont une lettre majuscule, une minuscule, un chiffre et un caractère spécial");
            $("#s-pass")[0].reportValidity();
            alert("Le mot de passe doit contenir au minimum 8 caractères dont une lettre majuscule, une minuscule, un chiffre et un caractère spécial");
        }
        if(!isPass2Ok) {
            $("#s-pass2")[0].setCustomValidity("Les deux mots de passes ne correspondent pas");
            $("#s-pass2")[0].reportValidity();
            alert("Les deux mots de passes ne correspondent pas");
        }
        if(!isAgeOk) {
            $("#s-age")[0].setCustomValidity("Vous devez avoir plus de 16 ans pour utiliser Kulty");
            $("#s-age")[0].reportValidity();
            alert("Vous devez avoir plus de 16 ans pour utiliser Kulty");
        }
        if(!isTosOk) {
            $("#s-tos")[0].setCustomValidity("Vous devez accepter nos conditions d'utilisation pour utiliser Kulty");
            $("#s-tos")[0].reportValidity();
            alert("Vous devez accepter nos conditions d'utilisation pour utiliser Kulty");
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
