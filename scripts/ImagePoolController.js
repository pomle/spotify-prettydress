function ImagePoolController(interval, applier, jumper)
{
	var self = this;
	var timer = null;
	var images = [];
	var currentIndex = null;
	var currentURL = null;

	this.add = function(url)
	{
		images.push(url);
	}

	this.clear = function()
	{
		images = [];
	}

	this.goto = function(index)
	{
		if (index < 0) {
			index = 0;
		}
		else if (index >= images.length) {
			index = images.length - 1;
		}

		currentIndex = index;

		return currentIndex;
	}

	this.image = function()
	{
		if (images[currentIndex]) {
			return images[currentIndex];
		}
		return null;
	}

	this.length = function()
	{
		return images.length;
	}

	this.load = function(callback)
	{
		var url = this.image();

		if (null === url) {
			console.log('URL is null', url);
			return false;
		}

		if (currentURL === url) {
			console.log('Current URL same as New, skipping load', url);
			return false;
		}

		currentURL = url;

		var imgLoader = new Image();
		imgLoader.onload = function() {
			callback(this);
		};
		imgLoader.src = url;

		return true;
	}

	this.shuffle = function()
	{
		for(
			var j, x, i = images.length; i;
			j = parseInt(Math.random() * i),
			x = images[--i], images[i] = images[j], images[j] = x
		);
	}

	this.skip = function(steps)
	{
		if (images.length == 0) {
			return false;
		}

		currentIndex = (currentIndex + steps) % images.length;
		if(currentIndex < 0) {
			currentIndex += images.length;
		}
		console.log('CurrentIndex', currentIndex);
	}

	this.update = function()
	{
		clearTimeout(timer);
		self.load(applier);
		jumper(self);
		timer = setTimeout(self.update, interval);
	}
}