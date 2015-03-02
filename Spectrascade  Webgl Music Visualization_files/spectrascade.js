/**
 * This file is part of Spectrascade.
 * Copyright (C) 2012
 * Jeshua Bratman and Anna Chen (jeshuabratman[AT]gmail.com, anna1110[AT]gmail.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software to use in any way you see fit. We only ask you reference the
 * original authors if you find this code useful.
 **/

window.settings = new Settings();
window.stage = new Stage(window.settings);
window.skipSong = reset;
sglRegisterCanvas("mainCanvas", window.stage, 100000.0);

window.addEventListener("load", function() {
    BrowserDetect.init();
    if(window.stage.gl == undefined || BrowserDetect.browser == "MSIE")
        doWebglError()
    else{
        if(settings.song == "none")
            window.stage.selfUpdate = true;
        else{
            fftURL = 'http://jeshua.me:82/wavFFT.wsgi';
            window.paused = false;
            setTimeout("startSong()",300);
        }
    }
});

function stageUpdate(idx){
    if(window.paused == false) {
        visualsUpdate(idx);
    }
}

function reset(){
    if(window.dataTransfer != undefined)
        window.dataTransfer.stop()
    if(window.audio != undefined)
        window.audio.stop();   
    window.settings.getRandomSong();
    setTimeout("startSong()",100);
}

function startSong(){
    window.paused = false;
    var song = window.settings.song;
    window.meanAmp = new Array();
    window.binSum = new Array();
    window.topIndices = new Array();
    window.dataTransfer = 
        new DataTransfer(window.meanAmp,window.binSum,
                         window.topIndices,fftURL,song+".mp3")
    var baseURL = 'https://s3.amazonaws.com/jaVis';

    var audio = document.getElementById('audio');
    if (audio.canPlayType('audio/ogg;')) {
        audio.type= "audio/ogg";
        audio.src= baseURL+"/"+song + ".ogg"
    } else {
        audio.type= "audio/mpeg";
        audio.src= baseURL+"/"+song+".mp3";
    }

    window.audio = new Audio(stageUpdate,reset);
    document.getElementById('audio').setAttribute("controls","controls");
    window.dataTransfer.startTransfer();        
}

//--------------------------------------------------

function doWebglError(){
    document.getElementById("content").innerHTML = "";

    document.getElementById("errors").innerHTML = 
        "<div id='errorsBlock'><h3>Your browser doesn't seem to support WebGL. For more information, and to get a webgl enabled browser, see <a href='http://get.webgl.org'>get.webgl.org</a>.</h3>"
+"<br /><br />Webgl Enabled Browsers:<ul>"
+"<li>Google Chrome 9 or higher</li><li>Firefox 4 or higher</li><li>Safari 5.1 or higher on Leopard or newer.</li><li>Opera 12.00 or higher</li></ul>"
+"<br />Some common problems/solutions:<ul>"
+"<li><b>Problem: </b> Webgl not working in Google chrome <br /><b>Solution:</b>Run it with the arguments: 'google-chrome --enable-webgl --ignore-gpu-blacklist'</li>"
+"<li><b>Problem: </b> Webgl not working in Safari<br /><b>Solution:</b>make sure you enable WebGL in Preferences &gt; Advanced and check 'Show develop menu in menu bar', then go to Develop &gt; Enable WebGL</li>"
+"<li><b>Problem: </b> You're using internet explorer.<br /><b>Solution:</b> Switch to Chrome, Firefox, Opera or Safari.</li>"
+"</ul>"
}

