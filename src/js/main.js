// js pagina
$(document).ready(function(){
    $("#start").off("click").on("click", function() {
        $(".menu").fadeOut(500);
        $(".game").delay(510).fadeIn("slow", function () {
            gameStart();
            buyUpgrade();
        })
    })

    var fps = 30;
    var viewportHeight = $(window).height();
    var viewportWidth = $(window).width();

    var heroSpeed = 45;
    var speedCounter = 0;
    var projID = 0;
    var range = 100;

    var money = 0;

    var enemyCd = 45;
    var cdCounter = 0;
    var eneID = 0;
    var enemySpeed = 15000;
    var bulSpeed = 1300;
    var closestElement;
    var minDistance = 200;

    function gameStart() {
        tick()
    }

    function tick() {
        setTimeout(function() {
            requestAnimationFrame(tick);
            
            shoot();
            enemySpawn();
            checkHit();
     
        }, 1000 / fps);
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

                heroProjectile($(enemy));
                speedCounter = 0;
                return;
            }
        })
        speedCounter++;
    }

    function heroProjectile(target) {
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
        }, bulSpeed, "linear", function() {
            $(this).remove();
        })

        projID++
    }

    function buyUpgrade() {
        $("#speed").off("click").on("click", function() {
            heroSpeed = heroSpeed - (heroSpeed * 0.25);
            var cost = Number($(this).data().cost);
            money = money - cost;
            cost = cost + (cost * 0.5);
            $(this).data("cost", cost)
            checkMoney()
        })
        $("#rangeBtn").off("click").on("click", function() {
            minDistance = minDistance + 5;
            $("#range").css("width", minDistance * 2 + "px").css("height", minDistance * 2 + "px");
            var cost = Number($(this).data().cost);
            money = money - cost;
            cost = cost + (cost * 0.5);
            $(this).data("cost", cost)
            checkMoney()
        })
        $("#bulSpeed").off("click").on("click", function() {
            bulSpeed = bulSpeed - bulSpeed * 0.13;
            var cost = Number($(this).data().cost);
            money = money - cost;
            cost = cost + (cost * 0.5);
            $(this).data("cost", cost)
            checkMoney()
        })
    }

    function enemySpawn() {
        if (cdCounter >= enemyCd) {
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
            }, enemySpeed, "linear", function() {
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
                    checkMoney();
                }
            })
        })
    }

    function checkMoney() {
        $.each($(".bottom button"), function(m, button){
            console.log($(button).data("cost"))
            if (money < Number($(button).data("cost"))) {
                $(button).addClass("disabled");
            }
        })
        $(".money h2 span").html(money);
    }
 });