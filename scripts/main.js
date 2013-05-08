var LAST_FM_API_URL = 'http://ws.audioscrobbler.com/2.0/?api_key=de86032ef8ba603c63bf4527b29e3230';
var IMAGE_MIN_WIDTH = 600;
var IMAGE_MIN_HEIGHT = 400;

var currentArtistName = null;
var currentTrackName = null;

var e_canvas = $('.canvas');
var e_background = e_canvas.find('.background');
var e_portrait = e_canvas.find('.portrait');
var e_artistName = e_canvas.find('.artistName');
var e_trackName = e_canvas.find('.trackName');
var e_bio = e_canvas.find('.biography');

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
	},
	function(IP) {
		IP.skip(1);
	});

var PortraitImages = new ImagePoolController(9525,
	function(image) {

		var timing = 500;

		console.log('Portrait image to update', image, image.width, image.height);

		//e_portrait.css('background-image', 'url(' + image.src + ')');

		e_portrait.transition({
			'rotateY': '90deg'
		}, timing, 'easeInQuart', function() {
			e_portrait.css('-webkit-transform', 'rotateY(-90deg)');
			e_portrait.css('background-image', 'url(' + image.src + ')');
			e_portrait.transition({'rotateY': '0deg'}, timing, 'easeOutQuart');
		});
	},
	function(IP) {
		IP.skip(1);
	});

$(window).on('resize', function() {
	e_canvas.height($(this).height() + 100);
}).trigger('resize');


require(['$api/models'], function(models) {

	var player = models.player;

	player.addEventListener('change', function(event) {
		updateArtist(event.target);
	});

	player.load('track').done(updateArtist);
});

function updateArtist(player)
{
	player.load('track').done(function(player) {

		var track = player.track;

		console.log('Track', track);

		track.load('artists').done(function(track) {

			var artists = track.artists;

			if (track.name !== currentTrackName) {
				currentTrackName = track.name;

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

			console.log('Artists', artists);

			if (artists.length && artists.length > 0) {
				var artistName = artists[0].name;

				console.log(artistName);

				if (artistName !== currentArtistName) {
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

					e_bio.removeClass('exists');
					fetchArtistInfo(artistName, function(info) {
						if (info.bio) {
							e_bio.find('.content').html(info.bio);
							e_bio.addClass('exists');
						}
					});

					$.ajax({
						'type': "GET",
						'url': LAST_FM_API_URL + '&method=artist.getimages&artist=' + encodeURIComponent(artistName),
						'dataType': "xml",
						'success': function(xml) {
							var images = [];
							var xml = $(xml);

							BackgroundImages.clear();
							PortraitImages.clear();

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
						'complete': function() {
							if (0 === BackgroundImages.length()) {
								BackgroundImages.add('../resource/please_stand_by.jpg');
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
			}
		});
	});
}


function fetchArtistInfo(artistname, callback)
{
	$.ajax({
		'type': "GET",
		'url': LAST_FM_API_URL + '&method=artist.getinfo&artist=' + encodeURIComponent(artistname),
		'dataType': "xml",
		success: function(xml) {
			var info = {};
			var xml = $(xml);
			info.bio = xml.find('lfm>artist>bio>summary').text();
			callback(info);
		}
	});
}

