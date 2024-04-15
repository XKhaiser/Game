// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js'
import { getFirestore, collection, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

// js pagina
$(document).ready(function(){
    $('#modalStart').modal('show');

    var user = "";
    var tutorialCompleted = false;

    $("#save").off("click").on("click", function() {
        var name = $("#userName").val();
        if (name.length > 1) {
            user = name;
            $('#modalStart').modal('hide');
        } else {
            alert("Inserisci un nome valido!");
        }
    })

    $("#start").off("click").on("click", function() {
        if (!tutorialCompleted) {
            tutorial();
        } else {
            initGame()
        }
    })

    var fps = 30;
    var viewportHeight = $(window).height();
    var viewportWidth = $(window).width();

    var startDate = moment();

    var activeGame = false;

    var heroSpeed = 45;
    var speedCounter = 0;
    var projID = 0;
    var health = 10;
    var maxHealth = 10;
    var damage = 1;

    var money = 0;
    var magic = 0;
    var mana = 0;
    var score = 0;

    var enemyCd = 45;
    var cdCounter = 0;
    var eneID = 0;
    var enemySpeed = 15000;
    var enemyHealth = 1;
    var bulSpeed = 1300;
    var closestElement;
    var minDistance = 300 * (viewportWidth / 1920);

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

        heroSpeed = 45;
        speedCounter = 0;
        projID = 0;
        health = 10;
        maxHealth = 10;
        damage = 1;

        money = 0;
        magic = 0;
        mana = 10;
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

        $(".game button").addClass("disabled");
        $(".skills button").hide();
        $("#smite, #heal, #rage").show();

        $.each($("#btnMoney button"), function (i, button) {
            $(button).removeData();
            $(button).find(".cost").html($(button).attr("data-cost"))
        })
    }

    function tutorial() {
        $(".menu").fadeOut(500);
        $(".tutorial").delay(501).fadeIn(500);
        $(".tutorial").off("click").on("click", function() {
            if ($(".tutorial .imgTut1").is(":visible")) {
                $(".tutorial .imgTut1").fadeOut(function(){
                    $(".tutorial .imgTut2").fadeIn();
                });
            } else if ($(".tutorial .imgTut2").is(":visible")) {
                $(".tutorial .imgTut2").fadeOut(function(){
                    $(".tutorial .imgTut3").fadeIn();
                });
            } else if ($(".tutorial .imgTut3").is(":visible")) {
                $(".tutorial .imgTut3").fadeOut(function(){
                    $(".tutorial .imgTut4").fadeIn();
                });
            } else if ($(".tutorial .imgTut4").is(":visible")) {
                $(".tutorial .imgTut4").fadeOut(function(){
                    $(".tutorial .imgTut5").fadeIn();
                });
            } else {
                tutorialCompleted = true;
                $(".tutorial").fadeOut(500);
                initGame();
            }
        })
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
                
                shoot();
                enemySpawn();
                checkHit();
                checkDamage();
                manaRegen();
                updateTime();
        
            }, 1000 / fps);
        }
    }

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
            
            // Genera le coordinate casuali in base al lato scelto
            var x, y;
            switch(side) {
                case 0: // Sinistra
                x = 0 - 20;
                y = Math.floor(Math.random() * viewportHeight);
                break;
                case 1: // Destra
                x = viewportWidth;
                y = Math.floor(Math.random() * viewportHeight);
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

            $(".gameContainer").append("<div class='enemy' data-health='" + enemyHealth + "' id='ene" + eneID + "' style='top:" + startPos.top + "px;left:" + startPos.left + "px;background-image: url(" + (x < (viewportWidth / 2) ? "src/img/Goblin_run_right.gif" : "src/img/Goblin_run_left.gif") + ")'></div>");

            $("#ene" + eneID).animate({
                top: endPos.top + "px",
                left: endPos.left + "px"
            }, enemySpeed * randomSpeed, "linear", function() {
                $(this).remove();
            })
            eneID++;
            cdCounter = 0;
            return;
        }
        cdCounter++
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
                    if (enemyData > damage) {
                        $(enemy).data("health", enemyData - damage);
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

                    money += 1;
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

        $("#healthValue").html(health);
        $(".health .progress-bar").css("width", (health / maxHealth) * 100 + "%");

        if (health <= 0) {
            activeGame = false;

            if (activeGame) return;
            addScoreToFirebase(user, score).then(function() {
                youDied();
            });
        }
    }

    function youDied() {
        
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
                if (i <= 9) {
                    var html = '<li class="list-group-item d-flex justify-content-between align-items-center gap-4"><h6>' + point.user + '</h6><h6>' + point.score + '</h6></li>';

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

        if (activeGame)
            noCheat();
    });

    // $(window).on('blur', function(){
    //     if (activeGame)
    //         noCheat();
    // });

    function manaRegen() {
        if (mana + 0.02 <= 10) {
            mana += 0.005;
        } else {
            mana = 10;
        }

        $(".mana .progress-bar").css("width", (mana / 10) * 100 + "%");
        $("#manaValue").html(parseInt(mana));

        $.each($(".skills button"), function() {
            if (mana >= $(this).data().cost) {
                $(this).removeClass("disabled");
            } else {
                $(this).addClass("disabled");
            }
        })
    }

    async function addScoreToFirebase(user, score) {
        var campi = await loadTopScoresFromFirebase();

        // Controlla se esiste già un oggetto con la stessa proprietà "user"
        var existingUserIndex = campi.findIndex(item => item.user.toLowerCase() === user.toLowerCase());

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
 });