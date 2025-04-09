async function testServer () {
    var currentUserID = 1;
    try {
        const response = await fetch('http://188.216.235.20:3000/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getUserCharacters', currentUserID })
        });
  
        const result = await response.json();

        console.log(result);
        
      } catch (error) {
        console.error('Errore:', error);
      }
}

testServer();

function addPatchNotes() {
    $.ajax({
        type: "GET",
        url: "https://raw.githubusercontent.com/XKhaiser/Game/main/src/json/patches.json",
        data: "data",
        dataType: "json",
        success: function (response) {
            console.log(response);

            response.reverse();

            var html = "";

            if (response.length > 0) {
                $.each(response, function(i, item) {
                    html += item.title.toUpperCase() + " - " + item.date + " <br> <br> ";

                    if (item.changes.features.length > 0) {
                        html += "Features <br>";

                        $.each(item.changes.features, function(i, feature) {
                            html += "- " + feature + " <br>";
                        })

                        html += "<br>";
                    }

                    if (item.changes.fixes.length > 0) {
                        html += "Fixes <br>";

                        $.each(item.changes.fixes, function(i, fix) {
                            html += "- " + fix + " <br>";
                        })

                        html += "<br>";
                    }

                    if (item.changes.balances.length > 0) {
                        html += "Fixes <br>";

                        $.each(item.changes.balances, function(i, balance) {
                            html += "- " + balance + " <br>";
                        })

                        html += "<br>";
                    }
                })

                if (html != "") {
                    $("#modalStart code").html(html);
                }
            }
        }
    });
}

addPatchNotes();

function rotatePhone() {
    if ($(window).height() > $(window).width()) {
        $("#rotatePhone").fadeIn();
    } else {
        $("#rotatePhone").fadeOut();
        $("#save").on("click", function() {
            var element = document.documentElement;
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) { // Firefox
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) { // IE/Edge
                element.msRequestFullscreen();
            }
        })
        
    }
}

rotatePhone();

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgY29cfeSbp44zbY_VQQcCeIbCobQQELc",
  authDomain: "game-710e5.firebaseapp.com",
  projectId: "game-710e5",
  storageBucket: "game-710e5.appspot.com",
  messagingSenderId: "161097367088",
  appId: "1:161097367088:web:149ae6524541de6e0ab7f5"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);

var db = getFirestore(firebase);

var YOUR_CLIENT_ID = '368381369169-v4rlubsvcj6sj6m9eoqs9hdm9ukoes9u.apps.googleusercontent.com';
var YOUR_REDIRECT_URI = location.href.replace("/#", "");
console.log(YOUR_REDIRECT_URI)
var fragmentString = location.hash.substring(1);
var user;

// Parse query string to see if page request is coming from OAuth 2.0 server.
var params = {};
var regex = /([^&=]+)=([^&]*)/g, m;

while (m = regex.exec(fragmentString)) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
}
location.hash = "";
if (Object.keys(params).length > 0) {
    localStorage.setItem('oauth2-test-params', JSON.stringify(params) );
    if (params['state'] && params['state'] == 'try_sample_request') {
        trySampleRequest();
    }
} else {
    trySampleRequest();
}

// If there's an access token, try an API request.
// Otherwise, start OAuth 2.0 flow.
function trySampleRequest() {
    var params = JSON.parse(localStorage.getItem('oauth2-test-params'));
    if (params && params['access_token']) {
        fetch('https://www.googleapis.com/oauth2/v2/userinfo?' +
        'access_token=' + params['access_token'])
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            user = data;
            loadTopScoresFromFirebase().then(function (userScore) {
                var existingUserIndex = userScore.findIndex(item => item.user.id === user.id);
                initMenu();

                if (existingUserIndex !== -1) {
                    $(".form-check label").click();

                    addScoreToFirebase(user, 0);
                }
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            $("#profile").on("click", function() {
                oauth2SignIn(); // Prompt for user permission if token is invalid
            }) 
        });
    } else {
        $("#profile").on("click", function() {
            oauth2SignIn();
        })
    }
}

/*
* Create form to request access token from Google's OAuth 2.0 server.
*/
function oauth2SignIn() {
    // Google's OAuth 2.0 endpoint for requesting an access token
    var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    // Create element to open OAuth 2.0 endpoint in new window.
    var form = document.createElement('form');
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    var params = {'client_id': YOUR_CLIENT_ID,
                    'redirect_uri': YOUR_REDIRECT_URI,
                    'scope': 'https://www.googleapis.com/auth/userinfo.profile',
                    'state': 'try_sample_request',
                    'include_granted_scopes': 'true',
                    'response_type': 'token'};

    // Add form parameters as hidden input values.
    for (var p in params) {
        var input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        input.setAttribute('value', params[p]);
        form.appendChild(input);
    }

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
}

function initMenu() {
    $("#username").html(user.given_name)
    $("#imgUser").attr("src", user.picture)

    localStorage.setItem('user', JSON.stringify(user) );

    $("#start").removeClass("disabled");
}

// js pagina
$(document).ready(function(){
    $('#modalStart').modal('show');

    var tutorialCompleted = false;

    $("#save").on("click", function() {
        $('#modalStart').modal('hide');
    })

    $("#start").off("click").on("click", function() {
        initGame()
    })

    var fps = 30;
    var viewportHeight = $(window).height();
    var viewportWidth = $(window).width();
    var giocoFinito = false;
    var pause = false;
    var isTutorial = false;
    var firstEnemy = false;
    var firstUpgrade = false;
    var tutLoading = false;

    $("#pauseBtn").off("click").on("click", function() {
        pauseGame();
    })

    var startDate = moment();

    var activeGame = false;
    var dead = false;

    var heroSpeed = 45;
    var speedCounter = 0;
    var projID = 0;
    var health = 10;
    var maxHealth = 10;
    var healthRegen = 0;
    var damage = 1;

    var money = 0;
    var income = 1;
    var magic = 0;
    var mana = 10;
    var maxMana = 10;
    var manaRegen = 0.0025;
    var score = 0;

    var enemyCd = 45;
    var cdCounter = 0;
    var eneID = 0;
    var enemySpeed = 15000;
    var enemyHealth = 1;
    var bulSpeed = 1300;
    var closestElement;
    var minDistance = 300 * (viewportWidth / 1920);

    $("#btnMoney > div").css("display", "flex").hide();
    $("#btnMoney > div").first().show();
    $(".selUpgrade > button").removeClass("active")
    $(".selUpgrade > button").first().addClass("active")

    $("#range").css({
        "width": (minDistance * 2) + "px",
        "height": (minDistance * 2) + "px"
    });
    
    var upgrades = 0;
    var skills = 0;

    var rage = false;

    function initGame() {
        $(".menu").fadeOut(500);
        if ($("#riepilogo").is(":visible")) {
            $("#riepilogo").fadeOut(500);
        }
        $(".game").delay(510).fadeIn("slow", function () {
            activeGame = true;
            resetVars();
            gameStart();
            buyUpgrade();
            buyAbility();
            useSkill();
            sounds();
        })
    }

    function resetVars() {
        fps = 30;
        viewportHeight = $(window).height();
        viewportWidth = $(window).width();

        startDate = moment();

        dead = false;
        giocoFinito = false;

        isTutorial = $(".form-check input").is(":checked");
        firstEnemy = false;
        firstUpgrade = false;
        tutLoading = false;

        heroSpeed = 45;
        speedCounter = 0;
        projID = 0;
        health = 10;
        maxHealth = 10;
        healthRegen = 0
        damage = 1;

        money = 0;
        income = 1;
        magic = 0;
        mana = 10;
        maxMana = 10;
        manaRegen = 0.0025;
        score = 0;

        enemyCd = 45;
        cdCounter = 0;
        eneID = 0;
        enemySpeed = 15000;
        enemyHealth = 1;
        bulSpeed = 1300;
        closestElement;
        minDistance = 300 * (viewportWidth / 1920);

        $(".tempScore span").html(0)

        $("#range").css({
            "width": (minDistance * 2) + "px",
            "height": (minDistance * 2) + "px"
        });

        upgrades = 0;
        skills = 0;

        rage = false;

        $(".money h2 span").html(parseInt(money));
        $(".magic h2 span").html(parseInt(magic));

        getDamage(true);

        $(".game button:not(.selUpgrade button, #pauseBtn)").addClass("disabled");
        $(".skills button").hide();
        $("#smite, #heal, #rage").show();

        $.each($("#btnMoney button"), function (i, button) {
            $(button).removeData();
            $(button).find(".cost").html($(button).attr("data-cost"))
        })

        $("#btnMoney > div").css("display", "flex").hide();
        $("#btnMoney > div").first().show();
        $(".selUpgrade > button").removeClass("active")
        $(".selUpgrade > button").first().addClass("active")

        initUpgradeMenu();
    }

    function gameStart() {
        tick()
    }

    function sounds() {
        $("#track")[0].play();
        $("#track")[0].volume = 0.3;
    }

    function tick() {
        if (activeGame) {
            setTimeout(function() {
                requestAnimationFrame(tick);
                if (pause) return;
                
                shoot();
                enemySpawn();
                checkHit();
                checkDamage();
                regen();
                updateTime();
        
            }, 1000 / fps);
        }
    }

    function initUpgradeMenu() {
        $("#offenseBtn").off("click").on("click", function() {
            $(".selUpgrade button").removeClass("active");
            $(this).addClass("active");

            $("#btnMoney > div").hide();
            $("#offenseSec").show();
        });
        $("#defenseBtn").off("click").on("click", function() {
            $(".selUpgrade button").removeClass("active");
            $(this).addClass("active");

            $("#btnMoney > div").hide();
            $("#defenseSec").show();
        });
        $("#utilityBtn").off("click").on("click", function() {
            $(".selUpgrade button").removeClass("active");
            $(this).addClass("active");

            $("#btnMoney > div").hide();
            $("#utilitySec").show();
        });
    };

    function shoot() {
        closestElement = null;
        $.each($(".enemy"), function(index, enemy) {
            var enemyPos = {}
                enemyPos.top = $(enemy).position().top;
                enemyPos.left = $(enemy).position().left;

            var hero = {}
                hero.top = $("#hero").position().top;
                hero.left = $("#hero").position().left;

            var distance = Math.sqrt((enemyPos.left - hero.left) ** 2 + (enemyPos.top - hero.top) ** 2);

            if (distance <= minDistance) { // Controlla se il nemico è all'interno del raggio desiderato
                if (closestElement == null || distance < closestElement.distance) { // Controlla se è il nemico più vicino trovato finora
                    closestElement = {
                        element: $(enemy),
                        distance: distance
                    };
                }
            }
        })
        if (closestElement != null && speedCounter >= (rage ? heroSpeed / 4 : heroSpeed)) { // Controlla se è stato trovato un nemico entro il raggio e il personaggio principale è pronto a sparare
            heroProjectile(closestElement.element, closestElement.distance / minDistance);
            speedCounter = 0;
        } else {
            speedCounter++;
        }
    }

    function heroProjectile(target, distance) {
        var startPos = {};
            startPos.top = $("#hero").position().top - 45;
            startPos.left = $("#hero").position().left;

        var endPos = {};
            endPos.top = $(target).position().top + 15;
            endPos.left = $(target).position().left + 10;

        // Calcolare la differenza tra le coordinate Y e X
        var deltaY = endPos.top - startPos.top;
        var deltaX = endPos.left - startPos.left;

        // Calcolare l'angolo utilizzando Math.atan2()
        var angleInRadians = Math.atan2(deltaY, deltaX);
        var angleInDegrees = angleInRadians * (180 / Math.PI);

        $(".gameContainer").append("<div class='projectile' id='bul" + projID + "' style='transform: rotate(" + angleInDegrees + "deg)'></div>");
        $('#bul' + projID).css("top", startPos.top);

        $("#bul" + projID).animate({
            top: endPos.top + "px",
            left: endPos.left + "px"
        }, (rage ? (bulSpeed * distance) / 1.8 : bulSpeed * distance), "linear", function() {
            $(this).remove();
        })

        projID++
    }

    function buyUpgrade() {
        $("#speed").off("click").on("click", function() {
            if (money - Number($(this).data().cost) < 0) return;
            heroSpeed = heroSpeed - (heroSpeed * 0.25);
            var cost = Number($(this).data().cost);
            money = money - parseInt(cost);
            upgrades++;
            cost = cost + (cost * 0.5);
            $(this).data("cost", parseInt(cost));
            $(this).find(".cost").html(parseInt(cost));
            checkMoney()
        })
        $("#rangeBtn").off("click").on("click", function() {
            if (money - Number($(this).data().cost) < 0) return;
            minDistance = minDistance + 5;
            $("#range").css("width", minDistance * 2 + "px").css("height", minDistance * 2 + "px");
            var cost = Number($(this).data().cost);
            money = money - parseInt(cost);
            upgrades++;
            cost = cost + (cost * 0.5);
            $(this).data("cost", parseInt(cost));
            $(this).find(".cost").html(parseInt(cost));
            checkMoney()
        })
        $("#bulSpeed").off("click").on("click", function() {
            if (money - Number($(this).data().cost) < 0) return;
            bulSpeed = bulSpeed - bulSpeed * 0.13;
            var cost = Number($(this).data().cost);
            money = money - parseInt(cost);
            upgrades++;
            cost = cost + (cost * 0.5);
            $(this).data("cost", parseInt(cost));
            $(this).find(".cost").html(parseInt(cost));
            checkMoney()
        })
        $("#damage").off("click").on("click", function() {
            if (money - Number($(this).data().cost) < 0) return;
            damage++;
            var cost = Number($(this).data().cost);
            money = money - parseInt(cost);
            upgrades++;
            cost = cost + (cost * 0.85);
            $(this).data("cost", parseInt(cost));
            $(this).find(".cost").html(parseInt(cost));
            checkMoney()
        })

        // Defense
        $("#maxHealth").off("click").on("click", function() {
            if (money - Number($(this).data().cost) < 0) return;
            health += parseInt(maxHealth * 0.25);
            maxHealth += parseInt(maxHealth * 0.25);
            getDamage(true);
            var cost = Number($(this).data().cost);
            money = money - parseInt(cost);
            upgrades++;
            cost = cost + (cost * 0.85);
            $(this).data("cost", parseInt(cost));
            $(this).find(".cost").html(parseInt(cost));
            checkMoney()
        })
        $("#healthRegen").off("click").on("click", function() {
            if (money - Number($(this).data().cost) < 0) return;
            healthRegen += 0.001;
            var cost = Number($(this).data().cost);
            money = money - parseInt(cost);
            upgrades++;
            cost = cost + (cost * 0.85);
            $(this).data("cost", parseInt(cost));
            $(this).find(".cost").html(parseInt(cost));
            checkMoney()
        })

        // Utility
        $("#maxMana").off("click").on("click", function() {
            if (money - Number($(this).data().cost) < 0) return;
            mana += parseInt(maxMana * 0.25);
            maxMana += parseInt(maxMana * 0.25);
            getDamage(true);
            var cost = Number($(this).data().cost);
            money = money - parseInt(cost);
            upgrades++;
            cost = cost + (cost * 0.85);
            $(this).data("cost", parseInt(cost));
            $(this).find(".cost").html(parseInt(cost));
            checkMoney()
        })
        $("#manaRegen").off("click").on("click", function() {
            if (money - Number($(this).data().cost) < 0) return;
            manaRegen += 0.001;
            var cost = Number($(this).data().cost);
            money = money - parseInt(cost);
            upgrades++;
            cost = cost + (cost * 0.85);
            $(this).data("cost", parseInt(cost));
            $(this).find(".cost").html(parseInt(cost));
            checkMoney()
        })
        $("#income").off("click").on("click", function() {
            if (money - Number($(this).data().cost) < 0) return;
            income += income * 0.25;
            var cost = Number($(this).data().cost);
            money = money - parseInt(cost);
            upgrades++;
            cost = cost + (cost * 0.85);
            $(this).data("cost", parseInt(cost));
            $(this).find(".cost").html(parseInt(cost));
            checkMoney()
        })

    }

    function buyAbility() {
        $("#heal").off("click").on("click", function() {
            if (magic - Number($(this).data().cost) < 0) return;
            $("#healSkill").show();
            $(this).hide();
            var cost = Number($(this).data().cost);
            magic = magic - parseInt(cost);
            $(this).data("cost", parseInt(cost))
            $(this).find(".cost").html(parseInt(cost));
            checkMagic();
        })

        $("#smite").off("click").on("click", function() {
            if (magic - Number($(this).data().cost) < 0) return;
            $("#smiteSkill").show();
            $(this).hide();
            var cost = Number($(this).data().cost);
            magic = magic - parseInt(cost);
            $(this).data("cost", parseInt(cost))
            $(this).find(".cost").html(parseInt(cost));
            checkMagic();
        })

        $("#rage").off("click").on("click", function() {
            if (magic - Number($(this).data().cost) < 0) return;
            $("#rageSkill").show();
            $(this).hide();
            var cost = Number($(this).data().cost);
            magic = magic - parseInt(cost);
            $(this).data("cost", parseInt(cost))
            $(this).find(".cost").html(parseInt(cost));
            checkMagic();
        })
    }

    function useSkill() {
        $("#healSkill").off("click").on("click", function() {
            if (mana - 3 < 0) return;
            var _this = $(this);
            $(_this).addClass("loading");
            $("#healEffect").fadeIn(400).delay(200).fadeOut(400);
            if (health + (maxHealth * 0.5) > maxHealth) {
                health = maxHealth;
            } else {
                health = health + (maxHealth * 0.5);
            }
            getDamage(true);
            mana = mana - 3;
            skills++;

            setTimeout(function(){
                $(_this).removeClass("loading");
            }, 6000)
        })

        $("#smiteSkill").off("click").on("click", function() {
            if (mana - 4 < 0) return;
            var _this = $(this);
            $(_this).addClass("loading");
            $.each($(".enemy"), function(i, enemy) {
                var random = Math.floor(Math.random() * (1000 - 300 + 1)) + 300;

                var smiteHtml = '<div class="enemySmite" id="smite' + i + '" style="top:' + $(enemy).position().top + 'px;left:' + $(enemy).position().left + 'px"><img src="src/img/smite.gif" /></div>';

                setTimeout(function() {
                    $(".gameContainer").append(smiteHtml);
                    setTimeout(function() {
                        $("#smite" + i).remove();
                    }, 1550)
                }, random)
                
                $(enemy).delay(random).stop().fadeOut(300, function() {
                    $(enemy).remove();
                    enemyCd = enemyCd - enemyCd * 0.02;
                    enemySpeed = enemySpeed - enemySpeed * 0.002;
                    money += 1;
                    score += 1;
                    checkMoney();
                    if (score % 10 === 0) {
                        magic += 1;
                        checkMagic();
                    }
                })
            })

            mana = mana - 4;
            skills++;

            setTimeout(function(){
                $(_this).removeClass("loading");
            }, 6000)
        })

        $("#rageSkill").off("click").on("click", function() {
            if (mana - 5 < 0) return;
            var _this = $(this);
            $(_this).addClass("loading");
            
            rage = true;
            
            setTimeout(function() {
                rage = false;
            }, 7000);

            mana = mana - 5;
            skills++;

            setTimeout(function(){
                $(_this).removeClass("loading");
            }, 6000)
        })
    }

    function enemySpawn() {
        if (cdCounter >= enemyCd) {
            var randomSpeed = (Math.random() * (1.3 - 0.9) + 0.9).toFixed(1);

            // Genera un lato casuale (0 = sinistra, 1 = destra, 2 = superiore, 3 = inferiore)
            var side = Math.floor(Math.random() * 4);

            if (!firstEnemy && isTutorial)
                side = 1;
            
            // Genera le coordinate casuali in base al lato scelto
            var x, y;
            switch(side) {
                case 0: // Sinistra
                x = 0 - 20;
                y = Math.floor(Math.random() * viewportHeight);
                break;
                case 1: // Destra
                x = viewportWidth;
                y = !firstEnemy && isTutorial ? viewportHeight / 2 : Math.floor(Math.random() * viewportHeight);
                break;
                case 2: // Superiore
                x = Math.floor(Math.random() * viewportWidth);
                y = 0 - 20;
                break;
                case 3: // Inferiore
                x = Math.floor(Math.random() * viewportWidth);
                y = viewportHeight;
                break;
            }

            var startPos = {};
                startPos.top = y;
                startPos.left = x;

            var endPos = {};
                endPos.top = $("#hero").position().top;
                endPos.left = $("#hero").position().left;
            
            if (enemyCd < 14) {
                enemyCd = 45;
                enemyHealth++;
                var audioFile = "src/sounds/level.mp3";

                var audio = new Audio(audioFile);

                $("#newLevel").fadeIn("slow").delay(3500).fadeOut("slow");
                setTimeout(function() {
                    audio.volume = 1
                    audio.play();
                }, 400)
                

                audio.onended = function() {
                    $(audio).remove();
                };
            }

            var idNemico = eneID;

            var enemyHtml = "<div class='enemy' data-health='" + enemyHealth + "' data-maxhealth='" + enemyHealth + "' id='ene" + eneID + "' style='top:" + startPos.top + "px;left:" + startPos.left + "px;background-image: url(" + (x < (viewportWidth / 2) ? "src/img/Goblin_run_right.gif" : "src/img/Goblin_run_left.gif") + ")'>" +
                                '<div class="enemyHealth" style="width:100%">' +
                                '</div>' +
                            "</div>"

            $(".gameContainer").append(enemyHtml);

            $("#ene" + eneID).animate({
                top: endPos.top + "px",
                left: endPos.left + "px"
            }, enemySpeed * randomSpeed, "linear", function() {
                $(this).remove();
            })

            if (!firstEnemy && isTutorial) {
                tutLoading = true;
                setTimeout(function(){
                    $("#tutContainer").show();

                    var enPos = $("#ene" + idNemico).position();

                    var htmlDiv = "<div id='tutEnemy' class='position-absolute h-100 w-100 top-0' style='background-image: radial-gradient(circle at " + (enPos.left + 15) + "px " + (enPos.top + 18) + "px" + ", transparent 2.5vw, #0000005a 3vw);display:none;'></div>";

                    $("*").pause();
                    pause = true;
                    $("#tutContainer").html(htmlDiv);
                    $("#tutEnemy").fadeIn("slow");

                    var htmlCapMessage1 =    '<div class="my-auto ms-5">' +
                                                '<div class="p-4 rounded bg-dark text-white" id="tutEnemyMsg1" style="display:none;"><h5>Capitano</h5><p class="mb-0"></p></div>'
                                            '</div>';

                    $("#tutEnemy").append(htmlCapMessage1);
                    $("#tutEnemyMsg1").fadeIn("slow", function() {
                        var text = "Comandante, i goblin stanno avanzando verso di noi!";

                        textTypingEffect($("#tutEnemyMsg1 p"), text);
                    })

                    var htmlCapMessage2 = '<div class="p-4 rounded bg-dark text-white mt-3" id="tutEnemyMsg2" style="display:none;"><h5>Capitano</h5><p class="mb-0"></p></div>';

                    $("#tutEnemyMsg1").after(htmlCapMessage2);
                    $("#tutEnemyMsg2").delay(4500).fadeIn("slow", function() {
                        var text = "Niente panico, Comandante!<br /> La torre lancerà automaticamente frecce contro il nemico più vicino.<br /> Prepariamoci a respingerli!";

                        textTypingEffect($("#tutEnemyMsg2 p"), text);

                        setTimeout(function() {
                            $("#tutEnemyMsg2").after("<p id='tutEnemyClose' class='text-end text-white text-shadow fw-light mt-3' style='display:none;'>Clicca sullo schermo per continuare</p>");

                            $("#tutEnemyClose").fadeIn("slow");
                            $("#tutEnemy").off("click").on("click", function() {
                                $(this).fadeOut("slow", function() {
                                    $("#tutEnemy").remove()
                                    $("*").resume();
                                    pause = false;
                                    $("#tutContainer").hide();
                                    tutLoading = false;
                                });
                            })
                        }, 7500)
                    })
                }, 6500)
            }

            firstEnemy = true;
            eneID++;
            cdCounter = 0;
            return;
        }
        cdCounter++
    }

    function textTypingEffect(element, text, i = 0) {
        $(element).html(text.substring(0, i + 1));
    
        // Se abbiamo raggiunto la fine della stringa
        if (i === text.length - 1) {
            return;
        }
    
        setTimeout(() => textTypingEffect(element, text, i + 1), 38);
    }

    function checkHit() {
        $.each($(".projectile"), function(i, bullet) {
            var bulletPos = {}
                bulletPos.top = $(bullet).position().top;
                bulletPos.left = $(bullet).position().left;

            $.each($(".enemy"), function(index, enemy) {
                var enemyPos = {}
                    enemyPos.top = $(enemy).position().top;
                    enemyPos.left = $(enemy).position().left;

                var distance = Math.sqrt(Math.pow((enemyPos.left - bulletPos.left), 2) + Math.pow((enemyPos.top - bulletPos.top), 2));
                
                if (distance <= 25) {
                    var enemyData = Number($(enemy).data().health);
                    var random = Math.floor(Math.random() * 359)
                    var hitID = projID;

                    var hit = '<img class="position-absolute hit' + hitID + '" style="top:' + (enemyPos.top - 20) + 'px;left:' + (enemyPos.left - 20) + 'px;width:4.5vw;height:4.5vw;transform:rotate(' + random + 'deg)" src="src/img/hit.gif" />'
                    var hitDamage = '<h6 class="position-absolute damage dam' + hitID + '" style="display:none;top:' + (enemyPos.top - 20) + 'px;left:' + (enemyPos.left + 20) + 'px;">' + damage + '</h6>';

                    $(".game").append(hit);
                    $(".game").append(hitDamage);
                    $(".hit" + hitID).delay(500).fadeOut(100, function() {
                        $(this).remove();
                    });
                    $(".dam" + hitID).show().delay(300).fadeOut(800, function() {
                        $(this).remove();
                    });

                    if (enemyData > damage) {
                        $(enemy).data("health", enemyData - damage);
                        var healthBar = ($(enemy).data("health") / $(enemy).data("maxhealth")) * 100;
                        $(enemy).find(".enemyHealth").css("width", healthBar + "%");
                        $(bullet).remove();
                        return;
                    }
                    
                    $(bullet).remove();
                    $(enemy).remove();

                    var randomIndex = Math.floor(Math.random() * 5);
                    var audioFile = "src/sounds/death" + randomIndex + ".mp3";

                    var audio = new Audio(audioFile);

                    audio.play();
                    audio.volume = 0.24;

                    audio.onended = function() {
                        $(audio).remove();
                    };

                    enemyCd = enemyCd - enemyCd * 0.02;
                    enemySpeed = enemySpeed - enemySpeed * 0.0023;

                    money += income;
                    score += 1;

                    $(".tempScore span").html(score)

                    checkMoney();
                    if (score % 10 === 0) {
                        magic += 1;
                        checkMagic();
                    } 
                }
            })
        })
    }

    function checkMoney() {
        $.each($(".bottom #btnMoney button"), function(m, button){
            if (money < Number($(button).data("cost"))) {
                $(button).addClass("disabled");
            } else {
                $(button).removeClass("disabled");
            }
        })
        $(".money h2 span").html(parseInt(money));

        if (money >= 5 && !firstUpgrade && isTutorial) {
            firstUpgrade = true;
            
        }
    }

    function checkMagic() {
        $.each($(".bottom #btnMagic button"), function(m, button){
            if (magic < Number($(button).data("cost"))) {
                $(button).addClass("disabled");
            } else {
                $(button).removeClass("disabled");
            }
        })
        $(".magic h2 span").html(parseInt(magic));
    }

    function checkDamage() {
        $.each($(".enemy"), function(i, enemy) {
            var enemyPos = {}
                enemyPos.top = $(enemy).position().top;
                enemyPos.left = $(enemy).position().left;

            var heroPos = {}
                heroPos.top = $("#hero").position().top;
                heroPos.left = $("#hero").position().left;

            var distance = Math.sqrt(Math.pow((heroPos.left - enemyPos.left), 2) + Math.pow((heroPos.top - enemyPos.top), 2));
            if (distance <= 20) {
                $(enemy).remove();
                getDamage(false);
            }
        })
    }

    function getDamage(heal) {
        if (!heal) 
            health = health -1;

        $("#healthValue").html(parseInt(health));
        $("#healthMax").html(maxHealth);
        $(".health .progress-bar").css("width", (health / maxHealth) * 100 + "%");

        if (health <= 0) {
            activeGame = false;

            if (activeGame && dead) return;
            dead = true;
            addScoreToFirebase(user, score).then(function() {
                youDied();
            });
        }
    }

    function youDied() {
        if (giocoFinito) return;

        giocoFinito = true;
        
        var endDate = moment();
        var time = moment.duration(endDate.diff(startDate));
        
        $("#leaderboard li").remove()
        
        $(".enemy").remove();
        $(".game").fadeOut(500);
        $("#riepilogo").delay(501).fadeIn(500);

        $("#track")[0].pause();

        $("#score").html(score);
        $("#time").html(moment.utc(time.asMilliseconds()).format('HH:mm:ss'));
        $("#upNum").html(upgrades);
        $("#skillNum").html(skills);

        loadTopScoresFromFirebase().then(function(scores) {
            $.each(scores, function(i, point) {
                if (i <= 9 && point.score > 0) {
                    var html = '<li class="list-group-item d-flex justify-content-between align-items-center gap-4"><h6>' + point.user.given_name + '</h6><h6>' + point.score + '</h6></li>';

                    $("#leaderboard").append(html);
                }
            })
        }).catch(function(error) {
            console.error("Errore nel caricamento dei punteggi:", error);
            // Gestione degli errori, se necessario
        });

        $("#retry").off("click").on("click", function() {
            $("#start").trigger("click");
        })
        $("#btnMenu").off("click").on("click", function() {
            $("#riepilogo").fadeOut(500);
            $(".menu").delay(501).fadeIn(500);
        })
    }

    function updateTime() {
        var date = moment();
        var time = moment.duration(date.diff(startDate));

        $(".time span").html(moment.utc(time.asMilliseconds()).format('HH:mm:ss'));
    }

    function noCheat() {
        if (!activeGame) return;
        score = 0;
        activeGame = false;
        $("#cheats").fadeIn("slow", function() {
            $("#cheats .progress-bar").animate({
                width: "0%"
            }, 10000, "linear", function() {
                $("#cheats").fadeOut(500, function() {
                    $("#cheats .progress-bar").css("width", "100%");
                });
                youDied();
            });
        })
    }

    $(window).on("resize", function() {
        $("#range").css({
            "width": (minDistance * 2) + "px",
            "height": (minDistance * 2) + "px"
        });

        rotatePhone();

        if (activeGame)
            pauseGame();
    });

    $(window).on('blur', function(){
        if (activeGame && !tutLoading)
            pauseGame();
    });

    function regen() {
        if (mana + manaRegen < maxMana) {
            mana += manaRegen;
        } else {
            mana = maxMana;
        }

        if (health + healthRegen < maxHealth) {
            health += healthRegen;
        } else {
            health = maxHealth;
        }

        getDamage(true);

        $(".mana .progress-bar").css("width", (mana / maxMana) * 100 + "%");
        $("#manaValue").html(parseInt(mana));
        $("#manaMax").html(maxMana);

        $.each($(".skills button"), function() {
            if (mana >= $(this).data().cost) {
                $(this).removeClass("disabled");
            } else {
                $(this).addClass("disabled");
            }
        })
    }

    function pauseGame() {

        pause = true;
        $("*:not(#rotatePhone)").pause();

        $("#pauseMenu").fadeIn();

        $("#pauseMenu button").off("click").on("click", function() {
            pause = false;
            $("#pauseMenu").fadeOut();
            $("*").resume();
        })
    }
 });

async function loadTopScoresFromFirebase() {
    const docRef = doc(db, "scores", "punteggi");
    const docSnap = await getDoc(docRef);
    var data = docSnap.data().scores;
    const scores = [];
    data.forEach(childSnapshot => {
        const score = childSnapshot;
        scores.push(score);
    });
    scores.sort(function (a, b) {
        return b.score - a.score;
    }); // Ordina in modo decrescente
    return scores;
}

async function addScoreToFirebase(user, score) {
    var campi = await loadTopScoresFromFirebase();

    // Controlla se esiste già un oggetto con la stessa proprietà "user"
    var existingUserIndex = campi.findIndex(item => item.user.id === user.id);

    if (existingUserIndex !== -1) {
        // Se l'utente esiste già, aggiorna il punteggio
        if (campi[existingUserIndex].score <= score)
            campi[existingUserIndex].score = score;
    } else {
        // Se l'utente non esiste, aggiungi un nuovo oggetto
        campi.push({
            "user": user,
            "score": score
        });
    }

    await setDoc(doc(db, "scores", "punteggi"), {
        "scores": campi
    });
}