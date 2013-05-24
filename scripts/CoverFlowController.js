function CoverFlowController(parent)
{
	var items = [];
	var posBefore = -20;
	var posAfter = 120;

	this.itemCurrent = 0;
	this.itemsVisible = 5;

	this.append = function(element)
	{
		element.css('left', posAfter);
		items.push(element);
		parent.append(element);
	}

	this.prepend = function()
	{
		element.css('left', posBefore);
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
		var positionStart = 0;
		var positionEnd = 1;

		var totalWidth = parent.width();
		var incrementalWidth = totalWidth / (itemsVisibleTotal + 1);
		var visibleItemIndex = Math.max(this.itemsVisible - this.itemCurrent, 0);
		console.log('visibleItemIndex', visibleItemIndex);

		for (i in items) {

			var item = items[i];

			var myPosition = item.css('left');
			var myOffset = i - this.itemCurrent;
			var myZIndex = this.itemsVisible - Math.abs(myOffset);
			var myOpacity = 1;
			var mySize = myZIndex * 50 + 'px';
			var myYRotation = -myOffset * 16 + 'deg';

			console.log(mySize);

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

			item.css('left', myPosition);
			item.css('opacity', myOpacity);
			item.css('-webkit-transform',
				'translate3d(0, 0, ' + mySize + ') rotateY(' + myYRotation + ')');
			item.css('z-index', myZIndex);
		}
	}
}