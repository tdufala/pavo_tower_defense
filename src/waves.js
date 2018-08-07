/********************************************************************************
* Wave source code (wave.js)
* Description: contains source code for all wave logic: loading, time delay,
* etc.
*
*
*
**********************************************************************************/



module.exports = {
	//function that loads waves and returns a Phaser group
	loadWaves: function (level) {
		//wave file name
		var wavepath = 'src/waves/' + level + '.json';
		
		//load wave json
		var waveData;
		$.getJSON(wavepath, function(json) { 
			waveData = json
		
		
		
		});
		
		
	}
}
