var LAST_FM_API_KEY = '84b51ae6c5d600eb5cb10bf6fc98461b';
var LAST_FM_API_URL = 'http://ws.audioscrobbler.com/2.0/?api_key=' + LAST_FM_API_KEY;

/* Rejects images smaller than this for background. */
var IMAGE_MIN_WIDTH = 600;
var IMAGE_MIN_HEIGHT = 400;

var currentURI = null;
var currentArtistName = null;
var currentTrackName = null;

var ajaxImageFetcher = null;
var ajaxInfoFetcher = null;

/* Pre-point to common elements. */
var e_canvas = $('.canvas');
var e_background = e_canvas.find('.background');
var e_portrait = e_canvas.find('.portrait');
var e_artistName = e_canvas.find('.artistName');
var e_trackName = e_canvas.find('.trackName');
var e_bio = e_canvas.find('.biography');

/* Image pool for background images. */
var BackgroundImages = new ImagePoolController(23333,
	function(image) {

		var timing = 500;

		console.log('Background image to update', image, image.width, image.height);

		var ratio = (image.width / image.height);
		var isPortrait = ratio < 1;

		console.log('Ratio', ratio);
		console.log('Portrait', isPortrait);

		e_background.transition({
			'opacity': 0
		}, timing, function() {
			e_background.removeClass('zoom');
			e_background.removeClass('portraitMode');
			e_background.css('background-image', 'url(' + image.src + ')');
			if (isPortrait) {
				e_background.addClass('portraitMode');
			}
			e_background.addClass('zoom');
			e_background.transition({'opacity': 1}, timing);
		});
	});

/* Image pool for portrait images. */
var PortraitImages = new ImagePoolController(9525,
	function(image) {

		var timing = 500;

		var ratio = (image.width / image.height);

		/* Calculate how "far" we are from a perfectly square image. */
		var discrepancy = Math.abs(1 - ratio);

		console.log('Portrait ratio discrepancy', discrepancy);
		console.log('Portrait image to update', image, image.width, image.height);

		//e_portrait.css('background-image', 'url(' + image.src + ')');
		var e_content = e_portrait.find('.content');

		e_content.transition({
			'rotateY': '90deg'
		}, timing, 'easeInQuart', function() {
			/* Close-to-square images should fill the whole portrait to avoid bitter edges. */
			e_content.css('background-size', discrepancy < .2 ? 'cover' : 'contain');
			e_portrait.removeClass('hidden');
			e_content.css('-webkit-transform', 'rotateY(-90deg)');
			e_content.css('background-image', 'url(' + image.src + ')');
			e_content.transition({'rotateY': '0deg'}, timing, 'easeOutQuart');
		});
	});

function updateFromPlayer(player)
{
	player.load('track').done(function(player) {

		var track = player.track;

		console.log('Track', track);

		if (currentURI === track.uri) {
			console.log('Track not changed', track.uri);
			return false;
		}

		currentURI = track.uri;

		track.load('artists').done(function(track) {
			var artists = track.artists;
			if (artists.length && artists.length > 0) {
				updateState(artists[0].name, track.name);
			}
		});
	});
}

function updateArtistImages(artistname)
{
	if (ajaxImageFetcher) {
		ajaxImageFetcher.abort();
	}

	BackgroundImages.clear();
	PortraitImages.clear();

	ajaxImageFetcher = $.ajax({
		'type': "GET",
		'url': LAST_FM_API_URL + '&method=artist.getimages&artist=' + encodeURIComponent(artistname),
		'dataType': "xml",
		'success': function(xml) {
			var images = [];
			var xml = $(xml);

			xml.find('image>sizes').each(function(i) {

				var extralarge = $(this).find('size[name=extralarge]');
				var original = $(this).find('size[name=original]');
				var width = parseInt(original.attr('width'), 10);
				var height = parseInt(original.attr('height'), 10);

				if (extralarge) {
					PortraitImages.add(extralarge.text());
				}

				if (width >= IMAGE_MIN_WIDTH && height >= IMAGE_MIN_HEIGHT) {
					var url = original.text();
					console.log('Background Add', url, width, height, IMAGE_MIN_WIDTH, IMAGE_MIN_HEIGHT);
					BackgroundImages.add(url);
				}
			});

		},
		'error': function(a, b, c) {
			console.log(a,b,c);
		},
		'complete': function() {
			if (0 === BackgroundImages.length()) {
				BackgroundImages.add('resource/5.jpg');
				BackgroundImages.add('resource/3.jpg');
				BackgroundImages.add('resource/9.jpg');
			}

			BackgroundImages.shuffle();
			BackgroundImages.goto(0);
			BackgroundImages.update();

			PortraitImages.shuffle();
			PortraitImages.goto(0);
			PortraitImages.update();
		}
	});
}

function updateState(artistName, trackName)
{
	if (trackName !== currentTrackName) {
		currentTrackName = trackName;

		$('.trackNameContainer').transition({
			'left': '700px',
			'opacity': 0
		},
		600, 'easeOutExpo', function() {
			$(this).css({'left': '-200px'});
			e_trackName.text(currentTrackName);
			$(this).transition({
				'left': '0px',
				'opacity': 1
			}, 1000, 'easeOutExpo');
		});
	}

	if (artistName !== currentArtistName) {

		e_portrait.addClass('hidden');

		currentArtistName = artistName;

		e_background.transition({'opacity': 0});

		$('.artistNameContainer').transition({
			'top': '-30px',
			'opacity': 0
		},
		600, 'easeOutExpo', function() {
			e_artistName.text(artistName);
			$(this).transition({
				'top': '0px',
				'opacity': 1
			}, 1000, 'easeOutExpo');
		});

		updateArtistImages(artistName);
		updateArtistInfo(artistName);
	}
}

function updateArtistInfo(artistname)
{
	if (ajaxInfoFetcher) {
		ajaxInfoFetcher.abort();
	}

	e_bio.removeClass('exists');

	ajaxInfoFetcher = $.ajax({
		'type': "GET",
		'url': LAST_FM_API_URL + '&method=artist.getinfo&artist=' + encodeURIComponent(artistname),
		'dataType': "xml",
		'success': function(xml) {
			var info = {};
			var xml = $(xml);
			var bio = xml.find('lfm>artist>bio>summary').text();

			if (bio) {
				e_bio.find('.content').html(bio);
				e_bio.addClass('exists');
			}
		}
	});
}

/* Bind to elements that can be minimized. */
e_canvas.on('click', '.portrait,.biography', function(e) {

	/* If an anchor tag received the click, do not interrupt. */
	if (0 !== $(e.target).closest('a').length) {
		return true;
	}

	/* Otherwise, intercept. */
	e.preventDefault();
	$(this).toggleClass('minimize');
});

if (typeof require == 'function') {
	require(['$api/models'], function(models) {

		var player = models.player;

		player.addEventListener('change', function(event) {
			updateFromPlayer(event.target);
		});

		player.load('track').done(updateFromPlayer);
	});
}
else {
	updateState('Nero', 'Test');
}

var queueFlow = $('.queueFlow');

queueFlow.on('click', '.item', function(e) {
	console.log(e.target);
});


var CoverFlow = new CoverFlowController(queueFlow.find('.content'));

var cfi = 10;
while (cfi--) {
	CoverFlow.append($('<div class="item"><div class="cover"><div class="overlay"></div></div></div>'));
}

CoverFlow.itemCurrent = -9;
CoverFlow.updateCSS();

queueFlow.addClass('ready');

CoverFlow.itemCurrent = 0;
CoverFlow.updateCSS();