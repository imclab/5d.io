/**
 * This file is part of Spectrascade.
 * Copyright (C) 2012
 * Jeshua Bratman and Anna Chen (jeshuabratman[AT]gmail.com, anna1110[AT]gmail.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software to use in any way you see fit. We only ask you reference the
 * original authors if you find this code useful.
 **/

function DataTransfer(meanAmp,binSum,topIndices, url, mp3){
    var This = this;
    this.meanAmp = meanAmp;
    this.binSum = binSum;
    this.topIndices = topIndices;
    this.targetURL = url;
    this.mp3File = mp3;

    this.chunksPerQuery = 16;
    this.currentChunk;
    this.firstPackageReceived = false;
    this.secondPackageReceived = false;

    this.msPerChunk;

    // get from server
    this.numFrames;
    this.frameRate;
    this.maxChunk;
    this.startChunk;
    this.endChunk;
    this.chunkSize;
    this.halted = false;

    this.stop = function(){
        this.halted = true;
    }

    this.startTransfer = function(){    
        this.currentChunk = 0;
        $.post(
            this.targetURL, 
            {start:this.currentChunk, size: this.chunksPerQuery}, 
            function(data){
                This.dataArrived(data);
            });
    }
    
    
    this.dataArrived = function(data){
        var obj = jQuery.parseJSON(data);
        This.numFrames = obj[0].numFrames;
        This.frameRate = obj[0].frameRate;
        This.maxChunk = obj[0].maxChunk;
        This.startChunk = obj[0].startChunk;
        This.endChunk = obj[0].endChunk;
        This.chunkSize = obj[0].chunkSize;
        for(var i=0;i<This.endChunk - This.startChunk; i++){
            This.meanAmp.push(obj[1].meanAmp[i]);
            This.binSum.push(obj[2].binSum[i]);
            This.topIndices.push(obj[3].topIndices[i]);            
        }
        This.currentChunk = This.currentChunk + This.chunksPerQuery;
        
        // process data:
	// ==================@@__________@@==================

        //if(This.currentChunk > 200 && This.currentChunk < 300)
        //    console.log("break");


        if(This.firstPackageReceived == false){
	    
	    This.msPerChunk = This.chunkSize / This.frameRate * 1000;
            window.audio.setMsPerChunk(This.msPerChunk);
	    window.audio.play();
            This.firstPackageReceived = true;
        }
        
        // getting next section of data
        if(This.halted == false){
            if(This.currentChunk + This.chunksPerQuery < This.maxChunk){
                $.post(
                    This.targetURL,
                    {start:This.currentChunk, size: This.chunksPerQuery, song: This.mp3File},
                    function(data){
                        This.dataArrived(data);
                    }
                );
            }

            else if(This.currentChunk < This.maxChunk){
                $.post(
                    This.targetURL,
                    {start:This.currentChunk, size:This.maxChunk-This.currentChunk, song: This.mp3File},
                    function(data){
                        This.dataArrived(data);
                    }
                );
            }
            else  console.log("transfer complete");            
        } else  console.log("transfer halted");            

    };

}


