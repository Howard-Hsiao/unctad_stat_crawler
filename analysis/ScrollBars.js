// ScrollBars.js - Handle the combination of horizontal and vertical scroll bars

// This function ensures that the scroll bars are hidden so that they take up no space in the table.
// This allows the table to resize without being enlarged by the scroll bars (means the table can shrink).
function hideScrollBars() {
	// Hide both scroll bars.
	hScroll.hide();
	vScroll.hide();
}

// Show the scroll bars.
function showScrollBars() {
	// Show both scroll bars.
	hScroll.show();
	vScroll.show();
}

// Update and validate the scroll bar items counts and positions.
// Return true if any changes occurred.
function updateScrollBars() {
	var changed = hScroll.update();
	changed |= vScroll.update();
	return changed;
}

// Set a new number of items for the rows and columns and update the scroll bars.
function setScrollSizes(v, h) {
	hScroll.setItems(h);
	vScroll.setItems(v);

	updateScrollBars();
}

// Handle mouse wheel events.
function onMouseWheelScrolling(e) {
	if (!e)
		e = window.event; // IE event model

	var handled = true;

	// wheelDelta is always multiples of 120. We divide by 40 to move by 3 lines per click.
	var rows = e.detail ? e.detail : -e.wheelDelta / 40; //e.Detail means FireFox; e.wheelDelta means IE 

	// If the vertical scroll bar exists and is shown, scroll it. Otherwise, try horizontal.
	if ((typeof (vScroll) != "undefined") && (vScroll.getVisible() != vScroll.getItems())) {
		vScroll.scrollBy(rows);
	}
	else if ((typeof (hScroll) != "undefined") && (hScroll.getVisible() != hScroll.getItems()))
		hScroll.scrollBy(rows);
	else
		handled = false;

	// If we've handled this event, don't let anybody else see it.
	if (handled) {
		if (e.stopPropagation)
			e.stopPropagation(); // DOM Level 2
		else
			e.cancelBubble = true; // IE

		// Now prevent any default action.
		if (e.preventDefault)
			e.preventDefault(); // DOM Level 2
		else
			e.returnValue = false; // IE
	}
}

// Define names of key events
var KeyCodePAGEUP     = 33;
var KeyCodePAGEDOWN   = 34;
var KeyCodeEND        = 35;
var KeyCodeHOME       = 36;
var KeyCodeARROWLEFT  = 37;
var KeyCodeARROWUP    = 38;
var KeyCodeARROWRIGHT = 39;
var KeyCodeARROWDOWN  = 40;

// Handle key down events
function onKeyDownScrolling(e) {
	//If we're editing a calculated group and the focus is in the formula box or some name box or the search box, then Home/End and so on DO NOT apply to the item tree.
	//The same is true if we're in the item selection page and the focus is in the search box. Or if the focus is on useful links configured as HTML select control.
	var controlWithFocus = document.activeElement;
	if (controlWithFocus != null)
		if (controlWithFocus.type == "text" || controlWithFocus.type == "textarea" || controlWithFocus.type == "select-one")
			return;
	
	if (!e)
		e = window.event; // IE event model

	var handled = false;

	if ((typeof (vScroll) != "undefined") && (vScroll.getVisible() != vScroll.getItems())) {
		// Up Arrow (any Shift or Ctrl state)
		if ((e.keyCode == KeyCodeARROWUP) && !e.altKey) {
			var amount = 1;
			if (e.shiftKey)
				amount = vScroll.getVisible();
			else if (e.ctrlKey)
				amount = vScroll.getItems() + 1;
			vScroll.scrollBy(-amount);
			handled = true;
		}
		// Down Arrow (any Shift or Ctrl state)
		else if ((e.keyCode == KeyCodeARROWDOWN) && !e.altKey) {
			var amount = 1;
			if (e.shiftKey)
				amount = vScroll.getVisible();
			else if (e.ctrlKey)
				amount = vScroll.getItems() + 1;
			vScroll.scrollBy(amount);
			handled = true;
		}
		// Page Up (no modifiers)
		else if ((e.keyCode == KeyCodePAGEUP) && !e.altKey && !e.ctrlKey && !e.shiftKey) {
			vScroll.scrollBy(-vScroll.getVisible());
			handled = true;
		}
		// Page Down (no modifiers)
		else if ((e.keyCode == KeyCodePAGEDOWN) && !e.altKey && !e.ctrlKey && !e.shiftKey) {
			vScroll.scrollBy(vScroll.getVisible());
			handled = true;
		}
		// Home
		else if ((e.keyCode == KeyCodeHOME) && !e.altKey && !e.ctrlKey && !e.shiftKey) {
			vScroll.scrollBy(-(vScroll.getItems() + 1));
			handled = true;
		}
		// End
		else if ((e.keyCode == KeyCodeEND) && !e.altKey && !e.ctrlKey && !e.shiftKey) {
			vScroll.scrollBy(vScroll.getItems() + 1);
			handled = true;
		}
	}
	if ((typeof(hScroll) != "undefined") && (hScroll.getVisible() != hScroll.getItems())) {
		// Arrow Left (any Shift or Ctrl state)
		if ((e.keyCode == KeyCodeARROWLEFT) && !e.altKey) {
			var amount = 1;
			if(e.shiftKey)
				amount = hScroll.getVisible();
			else if(e.ctrlKey)
				amount = hScroll.getItems() + 1;
			hScroll.scrollBy(-amount);
			handled = true;
		}
		// Arrow right (any Shift or Ctrl state)
		else if ((e.keyCode == KeyCodeARROWRIGHT) && !e.altKey) {
			var amount = 1;
			if (e.shiftKey)
				amount = hScroll.getVisible();
			else if (e.ctrlKey)
				amount = hScroll.getItems() + 1;
			hScroll.scrollBy(amount);
			handled = true;
		}
	}

	// If we've handled this event, don't let anybody else see it.
	if (handled) {
		if (e.stopPropagation)
			e.stopPropagation(); // DOM Level 2
		else
			e.cancelBubble = true; // IE

		// Now prevent any default action.
		if (e.preventDefault)
			e.preventDefault(); // DOM Level 2
		else
			e.returnValue = false; // IE
	}
}