var mapChart = null;
var game = null;
var gameLoadState,gamePalayState,gameOverState;
var isMusicReady=false;
var pageNow=1;
///////////////////gloable variable//////////////////////////
$(function () {
initFullPage();
});
function  initFullPage(){ 
var fullpage=$('#fullpage').fullpage({
        anchors: ['s1', 's2', 's3', 's4','s5'],
        css3: true,
       // easing: 'easeOutBack',
        scrollingSpeed: 1000,
        verticalCentered: false,
        scrollBar:true,                                             
        keyboardScrolling:false,
        afterRender:afterFullPageInited,
        afterLoad: function (anchorLink, index) {
            pageNow=index;
           switch(index)
           {
               case 2:case2();break;
               case 3:case3();break;
                   case 4:case4();break;
                   case 5:case5();break;
               default:break;
           }
            
        },
        onLeave: function(index, nextIndex, direction){
        switch(index)
           {
               case 2:leave_case2();break;
               case 3:leave_case3();break;
               case 4:leave_case4();break;
               case 5:leave_case5();break;
               default:break;
           }
        }
    });

}
function afterFullPageInited(){
$('#section1').parallax();
$('#section2').parallax();
$('#subTitle').css('position','relative');
//echarts map
require.config({
    paths: {
        echarts: 'http://cdn.bootcss.com/echarts/2.2.7'
    }
});
require(
        ['echarts', 'echarts/chart/map'],
        function (ec) {
            mapChart = ec.init(document.getElementById('Map'));
            var option = {
                backgroundColor: '#1b1b1b',
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}'
                },
                 title : {
                    text: '我和你,心连心',
                    subtext:'这个标题太骚气',
                    x:'center',
                    textStyle : {
                        color: '#fff'
                    }
                },
                series: [{
                    name: '全国',
                    type: 'map',
                    roam: true,
                    hoverable: false,
                    mapType: 'china',
                    itemStyle: {
                        normal: {
                            borderColor: 'rgba(100,149,237,1)',
                            borderWidth: 0.5,
                            areaStyle: {
                                color: '#1b1b1b'
                            }
                        }
                    },
                    data: [],
                    geoCoord: {
                        '成都': [104.0703, 30.5411]  
                    },
                    markPoint: {
                        symbol: 'emptyCircle',
                        symbolSize: function (v) {
                            return 10 + v / 10
                        },
                        effect: {
                            show: true,
                            shadowBlur: 0
                        },
                        itemStyle: {
                            normal: {
                                label: {
                                    show: false
                                }
                            },
                            emphasis: {
                                label: {
                                    show: false
                                }
                            }
                        },
                        data: [
                            {
                                name: '成都',
                                value: 10
                            }
                            ]
                    }

                        }]
            };
            mapChart.setOption(option);
            getVisitorLoaction();
        }
    );
    //initAudio();
    requestAudio();
    //game
    buildGame();
}
//map part
function getVisitorLoaction() {
    //使用百度web服务
    var ak = "9IP1pY9NkNifSm3sEolfV2Ky"; //浏览器端ak
    var baseUrl = "http://api.map.baidu.com/location/ip";
    var url = baseUrl + "?ak=" + ak + "&coor=bd09ll&callback=?"; //跨域 使用jsonp
    $.getJSON(url, function (data) {
        if (data.status == 0) {
            var x = data.content.point.x;
            var y = data.content.point.y;
            var cityname = data.content.address_detail.city;
            var geocoordStr = "{'" + cityname + "':[" + x + "," + y + "]}";
            var geoCoord = eval("(" + geocoordStr + ")");
            addvisitor(geoCoord, cityname);
        } else {
            console.log("获取坐标错误")
        }
    });
}

function addvisitor(thegeocoord, cityname) {
    var newOption = {
        series: [{
            geoCoord: thegeocoord
        }]
    };
    mapChart.setOption(newOption, false);
    var makrline = {
        smooth: true,
        symbol: ['circle', 'circle'],
        symbolSize: 1,
        effect: {
            show: true,
            scaleSize: 2,
            period: 30,
            color: '#fff',
            shadowBlur: 10
        },
        itemStyle: {
            normal: {
                borderWidth: 1,
                label: {
                    show: false
                },
                lineStyle: {
                    type: 'solid',
                    shadowBlur: 10
                }
            }
        },
        data: [
                                [{
                name: cityname,
                smoothness: 0.2
            }, {
                name: '成都',
                value: 95
            }]
                            ]
    }
    //makrline.data[0][0].name = cityname;
    var mark={
        symbol: 'emptyCircle',
                        symbolSize: function (v) {
                            return 10 + v / 10
                        },
                        effect: {
                            show: true,
                            shadowBlur: 0
                        },
                        itemStyle: {
                            normal: {
                                color:"yellow",
                                label: {
                                    show: false
                                }
                            },
                            emphasis: {
                                label: {
                                    show: false
                                }
                            }
                        },
                        data: [
                            {
                                name: cityname,
                                value: 10
                            }
                            ]
    }
    mapChart.addMarkLine(0, makrline);
    mapChart.addMarkPoint(0,mark);
}
//audio  part
function requestAudio() {
    var random=Math.floor(Math.random()*10)+1; 
    if(random>5){
    random-=5;
    }
    var musicName="http://7xnbl7.com1.z0.glb.clouddn.com/music/m"+random+".mp3";
    audio.files = new Array(musicName);
    for (var a in audio.files) {
        var i = parseInt(a) + 1;
        var req = new XMLHttpRequest;
        req.open("GET", audio.files[i - 1], true);
        req.responseType = "arraybuffer";
        req.onload = function () {
            audio.context.decodeAudioData(req.response, function (buffer) {
                audio.buffer[i] = buffer;
                audio.source_loop[i] = {};
                audio.gain_loop[i] = audio.context[audio.compatibility.createGain]();
                audio.gain_loop[i].connect(audio.gain.collapse);
                if (audio.compatibility.start === "noteOn") {
                    audio.gain_once[i] = audio.context[audio.compatibility.createGain]();
                    audio.gain_once[i].connect(audio.gain.collapse)
                }
                isMusicReady=true;
                if(pageNow==3){
                    $('.spinner').hide();
                    $('#vis-div p').hide();
                    $('#vis').show();
                    playAudio();
                }
            }, function () {
                console.log('Error decoding audio "' + audio.files[i - 1] + '".')
            })
        };
        req.send()

    }
}

function playAudio() {
    audio.play(1, false);
}

function stopAudio() {
    audio.stop(1);
}
function buildGame(){
 var w=600,h=350;
 game = new Phaser.Game(w, h, Phaser.AUTO, 'game',{ preload: preload,create: create});
}
function preload(){ game.load.image('bgImg', 'style/imgs/bgbg.jpg');
				   game.load.image('girlImg', 'style/imgs/gamegirl.jpg');
}
function create(){
	var score = 0;
    var w=600,h=350;
	var bgSprite;
    gameLoadState={
        preload:function(){
        //game.stage.backgroundColor = '#1e3058';
		bgSprite=game.add.tileSprite(0, 0, w, h, 'girlImg');
        gamelabel = game.add.text(w/2, h/2, '加载中...', { font: '20px Arial', fill: '#000',align: 'center'  });
        gamelabel.anchor.setTo(-0.4, 0.4);
        game.load.spritesheet('player', 'style/imgs/player_my.png', 32, 32);
        game.load.spritesheet('enemy1', 'style/imgs/en1.png', 21, 60);
        game.load.spritesheet('enemy2', 'style/imgs/en2.png', 19, 55);  
       // game.load.image('bg', 'style/imgs/background-wall.png');  
        },
        create:function(){
            gamelabel.text="骚年你敢来挑战吗？\n躲过我的魔法\n请按键盘↑键开始";
            this.cursor = game.input.keyboard.createCursorKeys();
            
        },
        update: function() {
		if (this.cursor.up.isDown)
			game.state.start('Play');
	   }
    };

    gameOverState={
        create: function () {
		bgSprite=game.add.tileSprite(0, 0, w, h, 'girlImg');
        gamelabel = game.add.text(w/2, h/2, '骚年你太弱鸡了\n只拿到'+score+'分\n历史最高分:69\n想要更多力量\n点击下方按钮访问我的博客吧\n你也可以按↑键重新挑战', { font: '20px Arial', fill: '#000', align: 'center' });
		gamelabel.anchor.setTo(-0.1, 0.5);
		this.cursor = game.input.keyboard.createCursorKeys();
		this.time = this.game.time.now + 800;
        },
        update: function() {
		if (this.game.time.now > this.time && this.cursor.up.isDown)
			game.state.start('Play');
	   }
    };

    gamePalayState={
    create: function () {
		bgSprite=game.add.tileSprite(0, 0, w, h, 'bgImg');
		this.cursor = game.input.keyboard.createCursorKeys();

		this.player = game.add.sprite(w/2, h/2, 'player');
        game.physics.enable(this.player, Phaser.Physics.ARCADE); 
	    this.player.body.collideWorldBounds = true;
	    this.player.animations.add('bottom', [0, 1], 10, true);
	    this.player.animations.add('top', [4, 5], 10, true);
    	this.player.animations.add('right', [2, 3], 10, true);
    	this.player.animations.add('left', [6, 7], 10, true);

		this.enemies1 = game.add.group();
       this.enemies1.enableBody = true;
    this.enemies1.physicsBodyType = Phaser.Physics.ARCADE;
	    this.enemies1.createMultiple(60, 'enemy1');
	    this.enemies1.setAll('outOfBoundsKill', true);

		this.enemies2 = game.add.group();
     this.enemies2.enableBody = true;
    this.enemies2.physicsBodyType = Phaser.Physics.ARCADE;
	    this.enemies2.createMultiple(60, 'enemy2');
	    this.enemies2.setAll('outOfBoundsKill', true);
	    
	    this.labelScore = game.add.text(15, 10, 'score: 0', { font: '20px Arial', fill: '#fff' });
	    this.labelKeys = game.add.text(Math.floor(w/2)+1, h-50, '使用上下左右键移动', { font: '20px Arial', fill: '#fff' });
	    this.labelKeys.anchor.setTo(0.5, 1);

	   
	    this.enemyTime = 0;
	    this.scoreTime = 0;
	    score = 0;
	    this.firstKey = false;
	},

	update: function() {
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;

		if (this.cursor.up.isDown && !this.firstKey) {
			this.firstKey = true;
			this.game.add.tween(this.labelKeys).to( { alpha: 0 }, 800, Phaser.Easing.Linear.None).start();
		}

		if (this.cursor.left.isDown) {
			this.player.body.velocity.x = -300;
			this.player.animations.play('left');
		} 
	    else if (this.cursor.right.isDown) {
	        this.player.body.velocity.x = 300;
	        this.player.animations.play('right');
	    }
	    else if (this.cursor.up.isDown) {
	        this.player.body.velocity.y = -300; 
	        this.player.animations.play('top');
	    }
	    else if (this.cursor.down.isDown) {
	        this.player.body.velocity.y = 300;
	        this.player.animations.play('bottom');
	    }
	    else
	    	this.player.animations.stop();

	    if (this.game.time.now > this.enemyTime) 
	    	this.newEnemy();

	    if (this.game.time.now > this.scoreTime) {
	    	this.scoreTime = game.time.now + 1000;
	    	score += 1;
	    	this.labelScore.text = '分数: ' + score;
	    }

	    game.physics.arcade.overlap(this.player, this.enemies1, this.playerHit, null, this);
	    game.physics.arcade.overlap(this.player, this.enemies2, this.playerHit, null, this);
	},

	newEnemy: function() {
		this.enemyTime = game.time.now + 300; 
        var enemy=null;
		if (rand(2)==1){
	    	enemy = this.enemies1.getFirstExists(false);
        }
	    else{
            enemy = this.enemies2.getFirstExists(false);
        }
     
	    enemy.anchor.setTo(0.5, 0.5);
	    var randu = rand(4);

	    if (randu == 0){
            x = rand(w);
            y = -enemy.height/2+2;
            tox = rand(w); 
            toy = h + enemy.height;
        }
        else if (randu == 1){
            x = rand(w);
            y = h + enemy.height/2-2;
            tox = rand(w); 
            toy = -enemy.height;
        }
        else if (randu == 2){
            x = -enemy.width/2+2;
            y = rand(h);
            tox = w + enemy.width; 
            toy = rand(h);
        }
        else if (randu == 3){
            x = w + enemy.width/2-2;
            y = rand(h);
            tox = -enemy.width; 
            toy = rand(h);
        }	

        enemy.reset(x, y);
        enemy.angle = 90 + Math.atan2(y - toy, x - tox) * 180 / Math.PI;

	    this.game.add.tween(enemy).to( { x: tox, y: toy }, 3000, Phaser.Easing.Linear.None).start();
	    enemy.animations.add('move');
	    enemy.animations.play('move', 5, true);
	},

	playerHit: function(player, enemy) {
		game.state.start('Over');
	}
    
    
    
    };
    
game.state.add('Load',gameLoadState);
game.state.add('Play', gamePalayState);
game.state.add('Over', gameOverState);
game.state.start('Load');
}
function rand(num){ return Math.floor(Math.random() * num) };
function case2(){
$("#section2").addClass("myAnimationActive");
}
function case3(){
$("#section3").addClass("myAnimationActive");
if(isMusicReady){
   $('#vis-div p').hide();
    $('.spinner').hide();
    $('#vis').show();
    playAudio();
}
}
function case4(){
    $("#section4").addClass("myAnimationActive");
}
function case5(){
    $("#section5").addClass("myAnimationActive");
}
function leave_case2(){
$("#section2").removeClass("myAnimationActive");
}
function leave_case3(){
    $("#section3").removeClass("myAnimationActive");
    if(isMusicReady){
    stopAudio();}
}
function leave_case4(){
     $("#section4").removeClass("myAnimationActive");
}
function leave_case5(){
     $("#section5").removeClass("myAnimationActive");
}

