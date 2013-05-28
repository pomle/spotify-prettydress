function CoverFlowController(parent)
{
	this.items = [];

	this.lightFalloff = .6;
	this.rotationFalloff = 90;
	this.sizeFalloff = 400;

	this.itemCurrent = 0;
	this.itemsVisible = 5;

	var positionStart = '0';
	var positionEnd = '100%';


	this.append = function(element)
	{
		element.css('left', positionEnd);
		this.items.push(element);
		parent.append(element);
	}

	this.clear = function()
	{
		for (x in this.items) {
			this.items[x].remove();
		}
		this.items = [];
	}

	this.prepend = function(element)
	{
		element.css('left', positionStart);
		this.items.unshift(element);
		parent.prepend(element);
	}

	this.updateCSS = function updateCSS()
	{
		/* Do the math. */
		var itemsTotal = this.items.length;
		var itemsVisible = (this.itemsVisible * 2) + 1;
		var itemsVisibleTotal = Math.min(itemsVisible, itemsTotal);
		var itemsVisibleUsable = Math.max(this.itemsVisible, 1);
		console.log(itemsTotal, itemsVisible, itemsVisibleTotal, itemsVisibleUsable);

		var positionFraction = .5 / itemsVisibleUsable;
		console.log('Fraction', positionFraction);

		var totalWidth = parent.width();
		var incrementalWidth = totalWidth / (itemsVisibleTotal + 1);
		var visibleItemIndex = Math.max(this.itemsVisible - this.itemCurrent, 0);

		console.log('visibleItemIndex', visibleItemIndex);

		for (i in this.items) {

			var item = this.items[i];

			var myPosition = null;
			var myOffset = i - this.itemCurrent;
			var myAbsOffset = Math.abs(myOffset);
			var myProgress = myAbsOffset / itemsVisibleUsable;

			var myOpacity = 1;
			var mySize = -(this.sizeFalloff * myProgress) + 'px';
			var myYRotation = -myOffset * (this.rotationFalloff / itemsVisibleUsable) + 'deg';
			var myShadow = (this.lightFalloff * myProgress);

			if (i < this.itemCurrent - this.itemsVisible) {
				myOpacity = 0;
			}
			else if (i > this.itemCurrent + this.itemsVisible) {
				myOpacity = 0;
			}

			myPosition = (.5 + (positionFraction * myOffset)) * 100 + '%';

			console.log('Opacity', myOpacity);

			item.css('opacity', myOpacity);

			console.log('Offset / Size / Position / Rotation / AbsOffset',
				myOffset, mySize, myPosition, myYRotation, myAbsOffset);

			item.css('left', myPosition);
			item.css('-webkit-transform',
				'translate3d(0, 0, ' + mySize + ') rotateY(' + myYRotation + ')');

			item.find('.overlay').css('opacity', myShadow);
		}
	}
}