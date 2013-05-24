function CoverFlowController(parent)
{
	var items = [];

	this.lightFalloff = .6;
	this.rotationFalloff = 90;
	this.sizeFalloff = 65;

	this.itemCurrent = 0;
	this.itemsVisible = 5;

	var positionStart = '0';
	var positionEnd = '100%';


	this.append = function(element)
	{
		element.css('left', positionEnd);
		items.push(element);
		parent.append(element);
	}

	this.prepend = function(element)
	{
		element.css('left', positionStart);
		items.unshift(element);
		parent.prepend(element);
	}

	this.updateCSS = function updateCSS()
	{
		/* Do the math. */
		var itemsTotal = items.length;
		var itemsVisible = (this.itemsVisible * 2) + 1;
		var itemsVisibleTotal = Math.min(itemsVisible, itemsTotal);
		console.log(itemsTotal, itemsVisible, itemsVisibleTotal);

		var positionFraction = 1 / (itemsVisibleTotal);

		var totalWidth = parent.width();
		var incrementalWidth = totalWidth / (itemsVisibleTotal + 1);
		var visibleItemIndex = Math.max(this.itemsVisible - this.itemCurrent, 0);

		console.log('visibleItemIndex', visibleItemIndex);

		for (i in items) {

			var item = items[i];

			var itemsVisibleUsable = (this.itemsVisible || 1);


			var myPosition = null;
			var myOffset = i - this.itemCurrent;
			var myAbsOffset = Math.abs(myOffset);
			var myProgress = myAbsOffset / itemsVisibleUsable;

			var myOpacity = 1;
			var mySize = -myAbsOffset * this.sizeFalloff + 'px';
			var myYRotation = -myOffset * (this.rotationFalloff / itemsVisibleUsable) + 'deg';
			var myShadow = (this.lightFalloff * myProgress);

			if (i < this.itemCurrent - this.itemsVisible) {
				myPosition = positionStart;
				myOpacity = 0;
			}
			else if (i > this.itemCurrent + this.itemsVisible) {
				myPosition = positionEnd;
				myOpacity = 0;
			}
			else {
				myPosition = (.5 + (positionFraction * myOffset)) * 100 + '%';
			}

			console.log('Offset / Size / Position / Rotation / AbsOffset',
				myOffset, mySize, myPosition, myYRotation, myAbsOffset);

			item.css('left', myPosition);
			item.css('opacity', myOpacity);
			item.css('-webkit-transform',
				'translate3d(0, 0, ' + mySize + ') rotateY(' + myYRotation + ')');

			item.find('.overlay').css('opacity', myShadow);
		}
	}
}