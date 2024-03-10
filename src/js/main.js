// js pagina
$(document).ready(function(){
    $('#modalStart').modal('show');

    $("#start").off("click").on("click", function() {
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
        })
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

    var money = 0;
    var magic = 0;
    var mana = 0;
    var score = 0;

    var enemyCd = 45;
    var cdCounter = 0;
    var eneID = 0;
    var enemySpeed = 15000;
    var bulSpeed = 1300;
    var closestElement;
    var minDistance = 300;
    
    var upgrades = 0;
    var skills = 0;

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

        money = 0;
        magic = 0;
        mana = 10;
        score = 0;

        enemyCd = 45;
        cdCounter = 0;
        eneID = 0;
        enemySpeed = 15000;
        bulSpeed = 1300;
        closestElement;
        minDistance = 300;

        upgrades = 0;
        skills = 0;

        $(".money h2 span").html(parseInt(money));
        $(".magic h2 span").html(parseInt(magic));

        getDamage(true);

        $(".game button").addClass("disabled");
        $(".skills button").hide();

        $.each($("#btnMoney button"), function (i, button) {
            $(button).removeData();
        })
    }

    function gameStart() {
        tick()
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
        
            }, 1000 / fps);
        }
    }

    function shoot() {
        $.each($(".enemy"), function(index, enemy) {
            var enemyPos = {}
                enemyPos.top = $(enemy).position().top;
                enemyPos.left = $(enemy).position().left;

            var hero = {}
                hero.top = $("#hero").position().top;
                hero.left = $("#hero").position().left;

            var distance = Math.sqrt((enemyPos.left - hero.left) ** 2 + (enemyPos.top - hero.top) ** 2);
            if (distance <= minDistance && speedCounter >= heroSpeed) {
                closestElement = $(enemy);

                var distSpeed = distance / minDistance;

                heroProjectile($(enemy), distSpeed);
                speedCounter = 0;
                return;
            }
        })
        speedCounter++;
    }

    function heroProjectile(target, distance) {
        var startPos = {};
            startPos.top = $("#hero").position().top;
            startPos.left = $("#hero").position().left;

        var endPos = {};
            endPos.top = $(target).position().top;
            endPos.left = $(target).position().left;

        $(".gameContainer").append("<div class='projectile' id='bul" + projID + "'></div>");

        $("#bul" + projID).animate({
            top: endPos.top + "px",
            left: endPos.left + "px"
        }, bulSpeed * distance, "linear", function() {
            $(this).remove();
        })

        projID++
    }

    function buyUpgrade() {
        $("#speed").off("click").on("click", function() {
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
            bulSpeed = bulSpeed - bulSpeed * 0.13;
            var cost = Number($(this).data().cost);
            money = money - parseInt(cost);
            upgrades++;
            cost = cost + (cost * 0.5);
            $(this).data("cost", parseInt(cost));
            $(this).find(".cost").html(parseInt(cost));
            checkMoney()
        })
    }

    function buyAbility() {
        $("#heal").off("click").on("click", function() {
            $("#healSkill").show();
            var cost = Number($(this).data().cost);
            magic = magic - parseInt(cost);
            $(this).data("cost", parseInt(cost))
            $(this).find(".cost").html(parseInt(cost));
            checkMagic();
        })

        $("#smite").off("click").on("click", function() {
            $("#smiteSkill").show();
            var cost = Number($(this).data().cost);
            magic = magic - parseInt(cost);
            $(this).data("cost", parseInt(cost))
            $(this).find(".cost").html(parseInt(cost));
            checkMagic();
        })
    }

    function useSkill() {
        $("#healSkill").off("click").on("click", function() {
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

            $(".gameContainer").append("<div class='enemy' id='ene" + eneID + "' style='top:" + startPos.top + "px;left:" + startPos.left + "px;'></div>");

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
                    $(bullet).remove();
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
            youDied();
        }
    }

    function youDied() {
        activeGame = false;

        var endDate = moment();
        var time = moment.duration(endDate.diff(startDate));

        $(".enemy").remove();
        $(".game").fadeOut(500);
        $("#riepilogo").delay(501).fadeIn(500);

        $("#score").html(score);
        $("#time").html(moment.utc(time.asMilliseconds()).format('HH:mm:ss'));
        $("#upNum").html(upgrades);
        $("#skillNum").html(skills);

        $("#retry").off("click").on("click", function() {
            $("#start").trigger("click");
        })
        $("#btnMenu").off("click").on("click", function() {
            $("#riepilogo").fadeOut(500);
            $(".menu").delay(501).fadeIn(500);
        })
    }

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
 });