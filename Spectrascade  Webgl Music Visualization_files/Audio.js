/**
 * This file is part of Spectrascade.
 * Copyright (C) 2012
 * Jeshua Bratman and Anna Chen (jeshuabratman[AT]gmail.com, anna1110[AT]gmail.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software to use in any way you see fit. We only ask you reference the
 * original authors if you find this code useful.
 **/

function Audio(updateFunc,resetFunc){    
    var This = this;
    
    this.updateFunc = updateFunc;
    this.resetFunc = resetFunc;
    this.msPerChunk;
    this.loopPeriod = 45; // in ms
    this.timer = null;
    this.halted = false;

    this.play = function(){
        document.getElementById('audio').play();
    	This.startLoop();
    }

    this.stop = function(){
        this.halted = true;
        document.getElementById('audio').pause();
    }

    this.getCurrentTime = function(){  // return in ms
        return document.getElementById('audio').currentTime * 1000;
    }

    this.setMsPerChunk = function(t){
        This.msPerChunk = t;
    }

    this.getCurrentChunkIdx = function(){
	var currentTime = document.getElementById('audio').currentTime * 1000;
	return Math.floor(currentTime / This.msPerChunk);
    }

    this.getFutureChunkIdx = function(numUpdates){
	var time = numUpdates * this.loopPeriod;
	var futureTime = this.getCurrentTime() + time;
	return Math.floor(futureTime / This.msPerChunk);
    }

    this.startLoop = function(){
	var ended = document.getElementById('audio').ended;
	if(ended == true ){
	    This.endLoop();
            This.resetFunc();
	    return;
	}
        if(This.halted == true){
            This.endLoop();
            return;
        }
	This.update();
	This.timer = setTimeout("window.audio.startLoop()", This.loopPeriod);
    }

    this.endLoop = function(){
	if(This.timer != null){
	    clearTimeout(This.timer);
	    This.timer = null;
	}
    }

    this.update = function(){
	var idx = This.getCurrentChunkIdx();
        This.updateFunc(idx);	
    }
}



