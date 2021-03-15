"use strict";

$(document).ready(async function () {
    const isValid = await checkValidity();
    if(isValid) {
        updateMenu("oldpass");
        $("input").each(function() {
            this.oninput = e => {
                e.target.setCustomValidity("");
            }
        })
        $("#oldpass form").submit(login);
        $("#newpass form").submit(changepass);
        $("#mail form").submit(sendmail);
    } else {
        updateMenu("invalid");
    }
});

function updateMenu(hash = location.hash) {
    document.location.hash = hash;
    $("main").css("display", "none");
    $(`${document.location.hash}`).css("display", "");
}

async function checkValidity() {
    const param = new URLSearchParams(location.search);
        const sid   = param.get("sid");
        const name  = param.get("name");
    const response = await fetch(`https://api.kulty.app/user_log/check_reset_pass.php?sid=${sid}&name=${name}`)
    const result = await response.json();
    return result;
}

async function login(e) {
    e.preventDefault();
    const log  = JSON.parse(localStorage.getItem("session")).user_Name;
    const pass = $("#o-pass" ).val();

    const con = await post("https://api.kulty.app/user_log/connect_user.php", { name: log, pass: pass });
    if( con.state ) {
        updateMenu("newpass");
    } else {
        $("#o-pass")[0].setCustomValidity("Le mot de passe est incorrect");
        $("#o-pass")[0].reportValidity();
    }
    console.log(con);
}
async function changepass(e) {
    e.preventDefault();
    const log  = JSON.parse(localStorage.getItem("session")).user_Name;
    const pass  = $("#n-pass1").val();
    const pass2 = $("#n-pass2").val();

    const isPassOk  = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(pass);
    const isPass2Ok = pass == pass2;
    if( isPassOk && isPass2Ok ) {
        const con = await post("https://api.kulty.app/user_log/new_password.php", { name: log, pass });
        if( con.state ) {
            sessionStorage.setItem("message", "password changed");
            window.location.href = "/settings#profile";
        }
        console.log(con);
    } else {
        if(!isPassOk) {
            $("#n-pass")[0].setCustomValidity("Le mot de passe doit contenir au minimum 8 caractères dont une lettre majuscule, une minuscule, un chiffre et un caractère spécial");
            $("#n-pass")[0].reportValidity();
        }
        if(!isPass2Ok) {
            $("#n-pass2")[0].setCustomValidity("Les deux mots de passes ne correspondent pas");
            $("#n-pass2")[0].reportValidity();
        }
    }
}
function sendmail(e) {
    e.preventDefault();
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
