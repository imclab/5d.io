/**
 * This file is part of Spectrascade.
 * Copyright (C) 2012
 * Jeshua Bratman and Anna Chen (jeshuabratman[AT]gmail.com, anna1110[AT]gmail.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software to use in any way you see fit. We only ask you reference the
 * original authors if you find this code useful.
 **/


function Settings(settings) {this.reset();};
Settings.prototype.reset = function( ) { 
    this.develMode = true;
    var me = this;
    //reset and randomize settings
    $('<div id="randomizeAll" class="settingButton">randomize</div>').appendTo('#settingsDiv');  
    $('<br /><div id="resetAll" class="settingButton">reset</div>').appendTo('#settingsDiv');  
    var me = this;
    var randomize = function(){me.randomizeAll();}
    var reset = function(){me.resetAll();}
    $('#resetAll').bind('click', reset);
    $('#randomizeAll').bind('click', randomize);

    this.audioObject = document.getElementById('audio');
    //- SONGS
    songs = this.getSongs();

    this.getRandomSong();
    this.registerVariable("song","",function(v){
        for(s in songs)
            if(songs[s].file == v){                
                me.song = songs[s].file;
                me.songObj = songs[s];
                break;
            }
        if(v == "none")
            me.song = "none";
        me.showSong();
    },function(){return me.song;});
    me.showSong();

    //--------------------------------------------------
    // - Setting values

    this.musicFX = true;
    this.explodeEnabled = true;
    this.paused = false;
    this.multiSourceEnabled = false;
    this.spawnAtMouse  = false;
    this.mouseUpdate  = false;
    this.musicFXWhenPaused  = true;
    this.autoRotate  = false;
    this.autoRotateSpeed  = .01;
    this.cameraFollowEnabled = false;
    this.enableGrid = true;
    this.numParticleGroups = 18;
    // - Particle appearance
    this.pOverlay = true;

    //colors
    var colorSchemeNames = ["storm","fire"];
    this.colorScheme =  new MultiplicativeColorScheme(this.numParticleGroups);
    this.colorScheme.colorScheme1();

    //different textures look better big/small so we will adjust accordingly
    var textures = ["tex-flare.png","tex-blob.png","tex-plus.png","tex-star.png"];
    var textureBaseSizes = [5,3,0,0,0];
    var textureBaseMusicFXOffsets = [6,4,0,0,0];
    this.textureSizeBase = textureBaseSizes[0];
    this.textureMusicFXOffset = textureBaseMusicFXOffsets[0];
    this.texture = textures[0]

    // - Initialization settings
    this.maxParticles = 9000;
    this.particleLimit = 5500

    // - Animation settings
    this.updateFreq = 0.033;
    this.minUpdateFreq = 0.001;
    this.glLineWidth = 1.35;

    // - Spawn particles
    this.startSpread = .018;    
    this.startSizeFactor = 1;
    this.startVelFactor = .0005;
    this.spawnPerStep = 80;



    // - Force of gravity object
    this.gravForce = 0.0001;
    this.gravMax = 0.015;
    this.gravDistFactor = 2; //square of distance to gravity source

    // - Force toward ground
    this.downwardGrav = 0.0000;

    // - Maximium velocity for particles
    this.particleMaxV = 0.084;
    this.particleVDamping = .92;
    this.particleGrowthFactor = 0.01;
    this.particleEnergyFactor = 0.014;   
    this.particleTailLength = 1; 
    this.particleSizeBase = 23;

    // - Audo Control settings
    this.musicEnergyMultiplier = 9;

    // - Camera control
    this.cameraSpeed = -0.1;

    //--------------------------------------------------
    // Make UI for settings
    var step = 0.0001;
    this.makeSlider("num",100,this.maxParticles,this.particleLimit,10,
                    function(v){me.particleLimit = v;},0);
    this.makeSlider("spread",0,.3,this.startSpread,step,
                    function(v){me.startSpread = v;});
    this.makeSlider("spawn",10,900,this.spawnPerStep,2,
                    function(v){me.spawnPerStep = v;},0);

    //lifetime on log scale    
    var top1 = 10
    var denom1 = Math.exp(top1);    
    var init = -(Math.log(denom1*this.particleEnergyFactor)-top1);
    this.makeSlider("lifetime",0,top1,init,step,
                    function(v){
                        me.particleEnergyFactor = Math.exp(top1-v)/denom1;
                    },0);
    //gravity force on log scale
    var top2 = 15
    var denom2 = Math.exp(top2);    
    var init = Math.log(denom2*this.gravForce);
    this.makeSlider("gravF",-top2,top2,init,step,
                    function(v){                        
                        me.gravForce = Math.exp(Math.abs(v))/denom2;
                        if(Math.abs(me.gravForce) < 0.00001 
                           || Math.abs(v) < 0.00001)
                            me.gravForce = 0;
                        if(v < 0)
                            me.gravForce = -me.gravForce;
                        console.log(me.gravForce);
                    },0.1);

    this.makeSlider("gravExp",1,5,this.gravDistFactor,.5,
                    function(v){me.gravDistFactor= v;});

    this.makeSlider("cameraSpeed",-1,10,-this.cameraSpeed,step,
                    function(v){me.cameraSpeed= -v;});

    //mult by 100 to get better range
    /*    this.makeSlider("gravMax",0,.02*100,this.gravMax*100,step*100,
          function(v){me.gravMax = v/10;});*/

    /*    this.makeSlider("vMax",0,1,this.particleMaxV,step,
          function(v){me.particleMaxV = v;});*/

    this.makeSlider("vDamp",0,1,this.particleVDamping,step,
                    function(v){me.particleVDamping = v;},.05);

    this.makeSlider("pSzBase",0,80,this.particleSizeBase,step,
                    function(v){me.particleSizeBase = v;});

    /*    this.makeSlider("pGrowth",0,.3,this.particleGrowthFactor,step,
          function(v){me.particleGrowthFactor = v;});*/

    this.makeSlider("pTail",0,5,this.particleTailLength,1,
                    function(v){me.particleTailLength = v;});

    this.makeSlider("grav",-.001*100,.001*100,this.downwardGrav*100,step*100,
                    function(v){me.downwardGrav = v/100;},0);

    this.makeSlider("lineW",.01,9,this.glLineWidth,.01,
                    function(v){me.glLineWidth = v;});

    this.makeSlider("musicMult",0,80,this.musicEnergyMultiplier,step,
                    function(v){me.musicEnergyMultiplier = v;},1);

    //--------------------------------------------------
    //Texture dropdown
    
    this.makeDropdown("texture",textures,0,function(v){
        me.texture = textures[v];
        me.textureSizeBase = textureBaseSizes[v];
        me.textureMusicFXOffset = textureBaseMusicFXOffsets[v];
    },true);

    this.makeDropdown("colors",colorSchemeNames,0,function(v){
        if(v == 0)
            me.colorScheme.colorScheme1();
        else if(v == 1)
            me.colorScheme.colorScheme2();
        else if(v == 2)
            me.colorScheme.colorScheme3();
        else if(v == 3)
            me.colorScheme.colorScheme4();
        else if(v == 4)
            me.colorScheme.colorScheme5();
    },false);



    //--------------------------------------------------
    // Check Boxes
    /*this.makeCheck("pause",false,function(v){
        me.paused = v;
    });*/



    /*this.makeCheck("explodeEnabled",this.explodeEnabled,function(v){       
        me.explodeEnabled = v;
    },true);*/

    this.makeCheck("multiSource", this.multiSourceEnabled, function(v){
        me.multiSourceEnabled = v;
    },true);

    this.makeCheck("follow", this.spawnAtMouse, function(v){
        me.spawnAtMouse = v;
    },false);

    this.makeCheck("mouseUpdate", this.mouseUpdate, function(v){
        me.mouseUpdate = v;
    },false);
    this.makeCheck("rotate", this.autoRotate, function(v){
        me.autoRotate = v;
    },false);

/*    this.makeCheck("musixFXP", this.musicFXWhenPaused, function(v){
        me.musicFXWhenPaused = v;
    },false);*/

    this.makeCheck("camera", this.cameraFollowEnabled, function(v){
        me.cameraFollowEnabled = v;
    });
    this.makeCheck("additive",me.pOverlay,function(v){
        me.pOverlay = v;
    });
   

/*    if(this.develMode == true){
        this.makeCheck("grid", this.enableGrid, function(v){
            me.enableGrid = v;
        });
    }*/




    //--------------------------------------------------
    
    //get all variables from get string
    for(v in this.varList){
        g = get(v)
        if(g != undefined){
            if(g == "true")
                this.setVar(v,true);
            else if(g == "false")
                this.setVar(v,false)
            else
                this.setVar(v,g);
        }
    }

    $('<div id="getString"></div>').appendTo('#linksDiv'); 
    $('#settingsDiv').live('selectstart dragstart', 
                           function(evt){ evt.preventDefault(); return false; });
    $('#linksDiv').live('selectstart dragstart', 
                        function(evt){ evt.preventDefault(); return false; });
    $('#songInfoDiv').live('selectstart dragstart', 
                           function(evt){ evt.preventDefault(); return false; });
    
    this.updateGetString();
}

//--------------------------------------------------
//Register settings variables

Settings.prototype.varList = new Array();

Settings.prototype.registerVariable = function(name,defaultVal,setVar,getVar){
    var o = new Object()
    o.name = name;
    o.type = "generic";
    o.setVar = setVar;
    o.getVar = getVar;
    o.defaultVal = defaultVal;
    o.allowRandomize = false;    
    this.varList[name] = o;
}

Settings.prototype.registerBoolean = function(name,defaultVal,setVar,getVar,allowRandomize){
    var o = new Object()
    o.name = name;
    o.type = "boolean";
    o.setVar = setVar;
    o.getVar = getVar;
    o.defaultVal = defaultVal;
    if(allowRandomize == undefined) o.allowRandomize = false;
    else o.allowRandomize = allowRandomize;
    this.varList[name] = o;
}


Settings.prototype.registerSet = function(name,vals,defaultVal,setVar,getVar,allowRandomize){
    var o = new Object()
    o.name = name;
    o.type = "set";
    o.setVar = setVar;
    o.getVar = getVar;
    o.vals = vals;
    o.defaultVal = defaultVal;
    if(allowRandomize == undefined) o.allowRandomize = false;
    else o.allowRandomize = allowRandomize;
    this.varList[name] = o;
}

Settings.prototype.registerNumeric = function(name,defaultVal,min,max,step,variance,setVar,getVar){
    var o = new Object()
    o.name = name;
    o.type = "numeric";
    o.setVar = setVar;
    o.getVar = getVar;
    o.defaultVal = defaultVal;
    o.min = min;
    o.max = max;
    o.step = step;
    o.allowRandomize = true;
    if(variance == undefined) o.variance = (max - min)/5;
    else o.variance = variance
    this.varList[name] = o;
}

Settings.prototype.randomizeAll = function(){
    for(i in this.varList){
        var v = this.varList[i]
        console.log(v.name +" "+v.type)
        if(v.allowRandomize){
            if(v.type == "numeric"){
                var r = Math.nrand()*v.variance + v.defaultVal;
                console.log(r);            
                if(v.step >= 1)
                    r = Math.round(r);
                if(v.min < 0 && v.max > 0 && Math.random() < 0.3)
                    this.setVar(v.name,-r);
                else
                    this.setVar(v.name,r);
            } else if(v.type == "boolean"){
                if(Math.random() < 0.5)this.setVar(v.name,true);
                else this.setVar(v.name,false);
            } else if(v.type == "set"){
                var numVars = v.vals.length;
                var dart = Math.random()*numVars;
                for(i=0;i<numVars;i++)
                    if(dart < (i+1)){
                        this.setVar(v.name,i);
                        break;
                    }
            }
        }//end if randomize
    }//end variable loop
}
Settings.prototype.resetAll = function(){
    for(i in this.varList){
        v = this.varList[i]
        this.setVar(v.name,v.defaultVal)
    }
}



Settings.prototype.setVar = function(varName,v,updateUI){
    if(updateUI != undefined)
        this.varList[varName].setVar(v,updateUI);
    else
        this.varList[varName].setVar(v,true);
    this.updateGetString();
}
Settings.prototype.getVar = function(varName){
    return this.varList[varName].getVar();
}
Settings.prototype.updateGetString = function(){
    var url = window.location.href.split('?')[0]
    var str = "?";
    var str2 = "?";
    for(v in this.varList){
        d = this.varList[v].defaultVal;
        n = v+"="+this.getVar(v)+"&amp;";
        if(typeof(d) == typeof("")){
            if(this.getVar(v) != d){
                if(v!="song")
                    str += n;
                str2 += n;
            }
        } else{
            if(Math.abs(this.getVar(v)-d)>0.0001){
                str += n;
                str2 += n;
            }
        }
    }
    $('#getString').html("links"+
                         " -- <a href='"+url+"'>random song</a>"+
                         " -- <a href='"+url+"?song="+this.getVar("song")+"'>this song</a>"+
                         " -- <a href='"+url+str+"'>these settings (random song)</a>"+
                         " -- <a href='"+url+str2+"'>these settings (this song)</a>"+
                         " -- <a href='"+url+"?song=none'>no song</a>");
}



//--------------------------------------------------


Settings.prototype.makeSlider = function(name,min,max,val,step,fc,variance){
    var resetName = name+"reset";
    var boxName = name+"box";
    var sliderName = name+"slider";
    var reset = '<span class="settingReset" id="'+resetName+'">'+name+"</span>";
    var box = '<input id="'+boxName+'" class="settingVal"/>';
    var slider = '';
    //if the parameter value can go positive/negative we make two sliders
    if(min < 0 && max > 0){
        negSliderName = name+"sliderNeg";
        slider = '<div id="'+negSliderName+'" class="settingHalfSlider"/>'+
            '<div id="'+sliderName+'" class="settingHalfSlider"/>'

    }else{
        slider = '<div id="'+sliderName+'" class="settingSlider"></div>';
    }

    $('<div class="setting">'+reset+box+"<br />"+slider+'</div>')
        .appendTo('#settingsDiv');    
    $('#'+name+'val').html(val);
    
    //functions to get/set this variable externally
    setVar = function(v,updateUI) {
        v = parseFloat(v);
        if(updateUI==undefined)
            updateUI = true;
        if(v > max) v = max;
        if(v < min) v = min;
        if(updateUI){
            $('#'+boxName).prop("value",v);
            $('#'+sliderName).slider('value',v);
        }
        fc(v);
    }
    getVar = function() {        
        return parseFloat($('#'+boxName).val());
    }
    this.registerNumeric(name,val,min,max,step,variance,setVar,getVar);
    
    me = this;

    //now add functionality to ui
    updateSlider = function(e,ui){
        var v = parseFloat(ui.value);
        me.setVar(name,v);
    }

    if(min < 0 && max > 0){
        $('#'+sliderName).slider({
            min: 0,
            max: max,
            step: step,
            value: Math.max(val,0),
            slide: updateSlider
        });
        $('#'+negSliderName).slider({
            min: min,
            max: 0,
            step: step,
            value: Math.min(val,0),
            slide: updateSlider
        });
    }else{
        $('#'+sliderName).slider({
            min: min,
            max: max,
            step: step,
            value: val,
            slide: updateSlider
        });
    }

    updateBox = function(){ 
        val = parseFloat($('#'+boxName).val());
        me.setVar(name,val);
    }
    $('#'+boxName).val(val);
    $('#'+boxName).change(updateBox);

    reset = function() {
        $('#'+boxName).prop("value",val);
        $('#'+sliderName).slider('value',val);
        me.setVar(name,val);
    }
    $('#'+resetName).bind('click', reset);
    
}


//--------------------------------------------------


Settings.prototype.makeDropdown = function(name,vals,defaultVal,fc,allowRandomize){
    var inputName = name+"box";
    var input = '<select class="settingDropdown" id="'+inputName+'">';
    for(v in vals){
        input += "<option value=\""+v+"\">"+vals[v]+"</option>";
    }
    input += "</select>";
    $('<div class="setting">'+input+'</div>')
        .appendTo('#settingsDiv');    
    //functions to get/set this variable externally
    setVar = function(v,updateUI) {        
        if(updateUI==undefined) updateUI = true;
        if(updateUI) $('#'+inputName).val(v);
        fc(v);
    }
    getVar = function() {        
        return $('#'+inputName).val();
    }
    this.registerSet(name,vals,defaultVal,setVar,getVar,allowRandomize)
    
    me = this;
    update = function(){ 
        val = $('#'+inputName).val();
        me.setVar(name,val);
    }
    $('#'+inputName).val(defaultVal);
    $('#'+inputName).change(update);
}


//--------------------------------------------------



Settings.prototype.makeCheck = function(name,val,fc,allowRandomize){
    $('<div class="settingCheck">'+name+'<br/><input type="checkbox" id="'+name+'" value=""/></div>').appendTo('#settingsDiv');

    
    setVar = function(v,updateUI) {
        if(updateUI==undefined)
            updateUI = true;
        if(v!= true && v !=false){
            if(v != 0) v = true;
            else v = false;
        }
        if(updateUI){
            $('#'+name).prop("checked",v);
        }
        fc(v);
    }

    getVar = function(){        
        checked = $('#'+name).is(':checked');
        if(checked == undefined || checked == false)
            return false;
        else
            return true;
    }
    this.registerBoolean(name,val,setVar,getVar,allowRandomize);
    me = this;
    $('#'+name).prop("checked",val);
    $('#'+name).change(function(){
        me.setVar(name,$('#'+name).is(':checked'))
    });
}




//======================================================================
Settings.prototype.showSong = function(){
    var skip = '<div id="skipSong" class="settingButton">skip&gt;&gt;</div>'
    $('#songInfoDiv').html("<div>Song: "+this.songObj.name+
                           "<br />Artist: "+this.songObj.artist+
                           "<br />url: <a href=\""+this.songObj.url+"\">"+this.songObj.url+"</a>"+
                           "</div>"+skip);
    $('#skipSong').bind('click', function(){
        window.skipSong();
    });
}

Settings.prototype.getRandomSong = function(){
    rnd = Math.floor(Math.random()*(songs.length));
    this.song = songs[rnd].file;
    this.songObj = songs[rnd];
    this.showSong(this.songObj);
}

Settings.prototype.getSongs = function(){
    var songs = [
        {'file': "AcidKiller", 
         'name' : 'Acid Killer', 
         'artist' : 'Infected Mushroom',
         'url' : 'http://www.infected-mushroom.com'},
        {'file': "Arena",
         'name' : 'Arena',
         'artist' : 'VNV Nation',
         'url' : 'http://www.vnvnation.com'},
        {'file': "BigYellowTaxi",
         'name' : 'Big Yellow Taxi',
         'artist' : 'Counting Crows',
         'url' : 'http://www.countingcrows.com'},
        {'file': "BlackTambourine",
         'name' : 'Black Tambourine',
         'artist' : 'Beck',
         'url' : 'http://www.beck.com'},
        {'file': "BloodMusic",
         'name' : 'Blood Music',
         'artist' : 'Zeromancer',
         'url' : 'http://www.zeromancer.com'},
        {'file': "CapitalG",
         'name' : 'Capital G',
         'artist' : 'Nine Inch Nails',
         'url' : 'http://www.nin.com'},
        {'file': "DrunkenLullabies",
         'name' : 'Drunken Lullabies',
         'artist' : 'Flogging Molly',
         'url' : 'http://www.floggingmolly.com'},
        {'file': "Elektronaut",
         'name' : 'Elektronaut',
         'artist' : 'VNV Nation',
         'url' : 'http://www.vnvnation.com'},
        {'file': "EnjoyTheSilence",
         'name' : 'Enjoy The Silence',
         'artist' : 'Depeche Mode',
         'url' : 'http://www.depechemode.com'},
        {'file': "FahrenheitFairEnough",
         'name' : 'Fahrenheit Fair Enough',
         'artist' : 'Telefon Tel Aviv',
         'url' : 'http://www.telefontelaviv.com'},
        {'file': "Fidelity",
         'name' : 'Fidelity',
         'artist' : 'Regina Spektor',
         'url' : 'http://www.reginaspektor.com'},
        {'file': "FightTest",
         'name' : 'Fight Test',
         'artist' : 'The Flaming Lips',
         'url' : 'http://www.theflaminglips.com'},
        {'file': "FlashLight",
         'name' : 'Flashlight',
         'artist' : 'Parliament',
         'url' : 'http://www.georgeclinton.com'},
        {'file': "GetOverIt",
         'name' : 'Get Over It',
         'artist' : 'Ok Go',
         'url' : 'http://okgo.net'},
        {'file': "GlassDanse",
         'name' : 'Glass Danse',
         'artist' : 'The Faint',
         'url' : 'http://www.thefaint.com'},
        {'file': "GoFilm",
         'name' : 'Go Film',
         'artist' : 'Covenant',
         'url' : 'http://www.covenant.se'},
        {'file': "GoneToYourHead",
         'name' : 'Gone To Your Head',
         'artist' : 'Zeromancer',
         'url' : 'http://www.zeromancer.com'},
        {'file': "GuitarMan",
         'name' : 'Guitar Man',
         'artist' : 'Cake',
         'url' : 'http://www.cakemusic.com'},
        {'file': "HardestButtonToButton",
         'name' : 'The Hardest Button To Button',
         'artist' : 'The White Stripes',
         'url' : 'http://www.whitestripes.com'},
        {'file': "Hardfloor",
         'name' : 'Hardtrance Acperience',
         'artist' : 'Hardfloor',
         'url' : 'http://www.hardfloor.de'},
        {'file': "Holland1945",
         'name' : 'Holland 1945',
         'artist' : 'Neutral Milk Hotel',
         'url' : 'http://www.neutralmilkhotel.net'},
        {'file': "Human",
         'name' : 'Human',
         'artist' : 'Assemblage 23',
         'url' : 'http://www.assemblage23.com'},
        {'file': "IHearTheBells",
         'name' : 'I Hear The Bells',
         'artist' : 'Mike Doughty',
         'url' : 'http://www.mikedoughty.com'},
        {'file': "InbetweenDays",
         'name' : 'Inbetween Days',
         'artist' : 'The Cure',
         'url' : 'http://www.thecure.com'},
        {'file': "JustLikeYouImagined",
         'name' : 'Just Like You Imagined',
         'artist' : 'Nine Inch Nails',
         'url' : 'http://www.nin.com'},
        {'file': "Lataralus",
         'name' : 'Lataralus',
         'artist' : 'Tool',
         'url' : 'http://www.toolband.com'},
        {'file': "Loser",
         'name' : 'Loser',
         'artist' : 'Beck',
         'url' : 'http://www.beck.com'},
        {'file': "LotusAboveWater",
         'name' : 'Lotus Above Water',
         'artist' : 'Telefon Tel Aviv',
         'url' : 'http://www.telefontelaviv.com'},
        {'file': "Lovecats",
         'name' : 'Lovecats',
         'artist' : 'The Cure',
         'url' : 'http://www.thecure.com'},
        {'file': "Mitternacht",
         'name' : 'Mitternacht',
         'artist' : 'E Nomine',
         'url' : 'http://en.wikipedia.org/wiki/E_Nomine'},
        {'file': "Moldavia",
         'name' : 'Moldavia',
         'artist' : 'Front 242',
         'url' : 'http://www.front242.com'},
        {'file': "MrJones",
         'name' : 'Mr. Jones',
         'artist' : 'Counting Crows',
         'url' : 'http://www.countingcrows.com'},
        {'file': "NeverDoAnything",
         'name' : 'Never Do Anything',
         'artist' : 'Barenaked Ladies',
         'url' : 'http://www.barenakedladies.com'},
        {'file': "Nocturnal",
         'name' : 'Nocturnal',
         'artist' : 'Tiger Army',
         'url' : 'http://www.tigerarmy.com'},
        {'file': "Ossining",
         'name' : 'Ossining',
         'artist' : 'Mike Doughty',
         'url' : 'http://www.mikedoughty.com'},
        {'file': "Peace",
         'name' : 'We Come in Peace',
         'artist' : 'Dance 2 Trance',
         'url' : 'http://www.dance2trance.net'},
        {'file': "PersonalJesus",
         'name' : 'Personal Jesus',
         'artist' : 'Depeche Mode',
         'url' : 'http://www.depechemode.com'},
        {'file': "Pet",
         'name' : 'Pet',
         'artist' : 'A Perfect Circle',
         'url' : 'http://www.aperfectcircle.com'},
        {'file': "PPKResurrection",
         'name' : 'Resurrection',
         'artist' : 'PPK',
         'url' : 'http://en.wikipedia.org/wiki/PPK_(group)'},
        {'file': "Psycho",
         'name' : 'Psycho',
         'artist' : 'Infected Mushroom',
         'url' : 'http://www.infected-mushroom.com'},
        {'file': "Rebellion",
         'name' : 'Rebellion (Lies)',
         'artist' : 'Arcade Fire',
         'url' : 'http://www.arcadefire.com'},
        {'file': "Schism",
         'name' : 'Schism',
         'artist' : 'Tool',
         'url' : 'http://www.tollband.com'},
        {'file': "SheSaidSheSaid",
         'name' : 'She Said She Said',
         'artist' : 'Snake River Conspiracy',
         'url' : 'http://www.snakeriverconspiracy.com'},
        {'file': "ShutMeUp",
         'name' : 'Shut Me Up',
         'artist' : 'Mindless Self Indulgence',
         'url' : 'http://mindlessselfindulgence.com'},
        {'file': "SourTimes",
         'name' : 'Sour Times',
         'artist' : 'Portishead',
         'url' : 'http://www.portishead.co.uk'},
        {'file': "SpiritualTrance",
         'name' : 'Spiritual Trance',
         'artist' : 'Infected Mushroom',
         'url' : 'http://www.infected-mushroom.com'},
        {'file': "SuchGreatHeights",
         'name' : 'Such Great Heights',
         'artist' : 'The Postal Service',
         'url' : 'http://www.postalservicemusic.net'},
        {'file': "Symphonatic",
         'name' : 'Symphonatic',
         'artist' : 'Infected Mushroom',
         'url' : 'http://www.infected-mushroom.com'},
        {'file': "SymphonyInC",
         'name' : 'Symphony In C',
         'artist' : 'Cake',
         'url' : 'http://www.cakemusic.com'},
        {'file': "Timekiller",
         'name' : 'Timekiller',
         'artist' : 'Project Pitchfork',
         'url' : 'http://www.pitchfork.de'},
        {'file': "TooLittleTooLate",
         'name' : 'Too Little Too Late',
         'artist' : 'Barenaked Ladies',
         'url' : 'http://www.barenakedladies.com'},
        {'file': "TourDeForce",
         'name' : 'Tour De Force',
         'artist' : 'Covenant',
         'url' : 'http://www.covenant.se'},
        {'file': "WeWantTheFunk",
         'name' : 'We Want The Funk',
         'artist' : 'George Clinton & Parliament',
         'url' : 'http://www.georgeclinton.com'},
        {'file': "WhatIGot",
         'name' : 'What I Got',
         'artist' : 'Sublime',
         'url' : 'http://en.wikipedia.org/wiki/Sublime_(band)'},
        {'file': "WraithPinnedToTheMist",
         'name' : 'Wraith Pinned To The Mist and Other Games',
         'artist' : 'Of Montreal',
         'url' : 'http://www.ofmontreal.net'},
        {'file': "YouDontKnowMe",
         'name' : 'You Don\'t Know Me',
         'artist' : 'Ben Folds (feat. Regina Spektor)',
         'url' : 'http://www.benfolds.com'},
        {'file': "ZakAndSara",
         'name' : 'Zak and Sara',
         'artist' : 'Ben Folds',
         'url' : 'http://www.benfolds.com'},
        {'file': "Zerospace",
         'name' : 'Zerospace',
         'artist' : 'Kidney Thieves',
         'url' : 'http://www.kidneythieves.com'},
        {'file': "ZombieNation1",
         'name' : 'Kernkraft 400',
         'artist' : 'Zombie Nation',
         'url' : 'http://www.zombienation.com'},
        {'file': "ZombieNation2",
         'name' : 'Kernkraft 400',
         'artist' : 'Zombie Nation',
         'url' : 'http://www.zombienation.com'},
        {'file': "ZootSuitRiot",
         'name' : 'Zoot Suit Riot',
         'artist' : 'Cherry Poppin Daddies',
         'url' : 'http://www.daddies.com'},
        {'file': "Doubly",
         'name' : '(You Should Be) Doubly (Gratified)',
         'artist' : 'Mike Doughty',
         'url' : 'http://www.mikedoughty.com'},
        {'file': "Antebellum",
         'name' : 'Antebellum',
         'artist' : 'Vienna Teng',
         'url' : 'http://www.viennateng.com'}]
    return songs;
}



//======================================================================
//GETTERS

Settings.prototype.getParticleSizeBase = function(){
    return this.particleSizeBase + this.textureSizeBase - 20;
}
Settings.prototype.getMusicFXMultiplier = function(){
    return this.textureMusicFXOffset + this.musicEnergyMultiplier;
}
Settings.prototype.isPaused = function(){
    return this.paused || (this.song != "none" && this.audioObject.paused);
}
Settings.prototype.getBaseParticleColor = function(energy){
    return this.colorScheme.getParticleBase(energy)
}
Settings.prototype.getBaseTailColor = function(energy){
    return this.colorScheme.getTailBase(energy)
}

Settings.prototype.getSpawnPerStep = function(){
    if(this.spawnAtMouse)
        return Math.floor(this.spawnPerStep/10)
    else
        return this.spawnPerStep
}

Settings.prototype.getParticleGroupMod = function(){
    return 40+Math.floor(this.getSpawnPerStep());
}





