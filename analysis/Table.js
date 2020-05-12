// Table.js - Code for loading, resizing and displaying table data.
// Version 8.2.00600

var undefined;

// The 4 chunks that can be used to draw a page.
var M_tlChunk;	// top-left chunk
var M_trChunk;	// top-right chunk
var M_blChunk;	// bottom-left chunk	
var M_brChunk;	// bottom-right chunk

// Define the size of a chunk.
// This is the maximum number of rows and columns returned in a chunk.
var M_rowsPerChunk = 100;
var M_colsPerChunk = 100;
var M_rowsPrintable = 2147483647;   // Max Int (Max cell limit for printing is checked in OnPreparePrint)
var M_colsPrintable = 2147483647;

var M_tableRowCount = 0;
var M_tableColCount = 0;

var M_rowDimCount = 0;
var M_colDimCount = 0;

var M_rowHeaderClass;
var M_colHeaderClass;
var M_colHeaderSortClass;
var M_dataTableClass;
var M_dataTotalClass;

// This variable is used to record if a refresh was deferred due to the required data not
// being available. When new data is loaded, a fresh will occur when the chunk is loaded.
var M_refreshNeeded = false;

// Additional number of columns to append to table before filling it with data.
var M_additionalColumns = 5;
// Additional number of rows to append to table before filling it with data.
var M_additionalRows = 0;	// set to 0 for now because it does not seem to have an
							// impact on the number of rows that can fit on the screen.

// These constants contain the path of sort arrow images.
var M_strSortAscendingArrow = "../Common/Images/sorttoparrow.gif";
var M_strSortAscendingArrowActive = "../Common/Images/sorttoparrowactive.gif";
var M_strSortDescendingArrow = "../Common/Images/sortbottomarrow.gif";
var M_strSortDescendingArrowActive = "../Common/Images/sortbottomarrowactive.gif";

var M_strSummaryImage = "../Common/Images/info.gif"

// Separator for the footnote identifiers stored in the string in TableChunk.rowNotes
var M_footnoteSep = ","
// Separates the footnotes identifiers from the missing value identifier stored in the
// string in TableChunk.rowNotes
var M_footnoteMissingValSep = ";"

var M_sortItemSep = "\035";
var M_sortSectionSep = "\036";

// contains the index on the page (visible columns) of the sorted column.
var M_sortedColInfo = new SortInfo();

// The following constants are returned by the updateTable() function
var M_Update_Updated = 0; // The table was updated.
var M_Update_WaitingForData = 1; // The table was not updated because not enough data chunks were available.

// If totals/percentages have been selected, M_totalPrctType has one of the 4 following values:
// M_rowTotal, M_colTotal, M_rowPercent, M_colPercent.  Any other value means that totals/percentages
// have not been selected.
var M_totalPrctType;
var M_totalPrctUnspecified = 0;
var M_rowTotal = 1;
var M_colTotal = 2;
var M_rowPercent = 3;
var M_colPercent = 4;

var M_displayGroupLinks = true;

var M_bSupport508 = true;

var M_summaryTooltip = "";

// true if there is cell coloring info for the table; false otherwise
var M_bCellColor = false;

self.setInterval('GHandleFontSizeChange()', 2000)

// This object is simply used to hold the information about a chunk all in one place.
function TableChunk(
	i_firstRow,
	i_lastRow,
	i_firstCol,
	i_lastCol,
	i_rowLabels,
	i_colLabels,
	i_otherLabels,
	i_rowIDs,
	i_colIDs,
	i_otherIDs,
	i_rowDrillLabels,
	i_colDrillLabels,
	i_otherDrillLabels,
	i_rowIsGroup,
	i_colIsGroup,
	i_otherIsGroup,
	i_rowHasSummary,
	i_colHasSummary,
	i_otherHasSummary,
	i_rowIsColCustomGroup,
	i_colIsRowCustomGroup,
	i_rowLabelSpans,
	i_colLabelSpans,
	i_rowData,
	i_rowNotes
	)
{
	this.firstRow  = i_firstRow;
	this.lastRow   = i_lastRow;
	this.firstCol  = i_firstCol;
	this.lastCol   = i_lastCol;
	this.rowLabels = i_rowLabels;
	this.colLabels = i_colLabels;
	this.otherLabels = i_otherLabels;
	this.rowIDs = i_rowIDs;
	this.colIDs = i_colIDs;
	this.otherIDs = i_otherIDs;
	this.rowDrillLabels = i_rowDrillLabels;
	this.colDrillLabels = i_colDrillLabels;
	this.otherDrillLabels = i_otherDrillLabels;
	this.rowIsGroup = i_rowIsGroup;
	this.colIsGroup = i_colIsGroup;
	this.otherIsGroup = i_otherIsGroup;
	this.rowHasSummary = i_rowHasSummary;
	this.colHasSummary = i_colHasSummary;
	this.otherHasSummary = i_otherHasSummary;
	this.rowIsColCustomGroup = i_rowIsColCustomGroup;
	this.colIsRowCustomGroup = i_colIsRowCustomGroup;
	this.rowLabelSpans = i_rowLabelSpans;
	this.colLabelSpans = i_colLabelSpans;
	this.rowData   = i_rowData;
	this.rowNotes   = i_rowNotes;
}

// This object holds information about the table size.
function TableSize() {
	this.colCount = 0;
	this.rowCount = 0;
	this.tableWidth = 0;
	this.tableHeight = 0;
	this.vScrollWidth = 0;
	this.hScrollHeight = 0;
}

// This object holds information about the sorted column.
function SortInfo() {
	this.m_index = -1;	// index of the sorted column
	this.m_order = -1;  // order of the sorted column - 0 for descending, 1 for ascending,
						//		 -1 if nothing if there is not sorting.
}

// Initialize the list of table chunks.
var M_tableChunks;

// A reference to the table that contains the data table and the 2 scroll bars.
var M_mainTable;

// This variable is a reference to the HTML data table.
var M_dataTable;

// This variable is a reference to the other dimensions HTML table.
var M_otherDimTable;

// This variable is a reference to the vertical scroll bar cell.
var M_vScrollBarCell;

// This variable is a reference to the horizontal scroll bar cell.
var M_hScrollBarCell;

// An array of size M_rowDimCount - 1 that is used (in resizeTable) to calculate the span
// of items in each nesting row dimension.
var M_rowSpanIndexes;

// An array of size M_rowDimCount - 1 that is used (in resizeTable) to calculate the span
// of items in each nesting row dimension.
var M_rowSpanCounts;

// Arrays of size M_rowDimCount that are used (in updateTable) to hold the index of the first
// item label to draw (index into TableChunk.i_rowLabels, and TableChunk.i_colLabels) for each
// row and column dimension.
var M_firstRowLabelIndexes;
var M_firstColLabelIndexes;
var M_firstRowLabelIndexesOld;
var M_firstColLabelIndexesOld;
var M_oldRowCounts;
var M_oldColCounts;
var M_firstColLabelIndexesForSorting;
	
	
// This variable is used in updateTable().  It is true if the 'bottom' chunks are being used to update
// the table.
var M_startInBottomChunk;
// This variable is used in updateTable().  It is true if the 'right' chunks are being used to update
// the table.
var M_startInRightChunk;

// This variable is an array of boolean values and is used in updateTable().  It contains a value for
// each nesting row dimension.  For a dimension, the corresponding value is True if and only if the
// item label spans the top and bottom chunks of data.
var M_doesRowLabelSpanChunks;

// This variable is an array of boolean values and is used in updateTable().  It contains a value for
// each nesting column dimension.  For a dimension, the corresponding value is True if and only if the
// item label spans the left and right chunks of data.
var M_doesColLabelSpanChunks;

// Arrays of size M_rowDimCount - 1 that are used (in updateTable) to hold the span
// of items in each nesting row and column dimension.
var M_rowLabelSpans;
var M_colLabelSpans;

// The dimension indexes as specified in the XML document by the "id" attribute of each dimension
var M_rowDimIDs = new Array();
var M_colDimIDs = new Array();
var M_otherDimIDs = new Array();
var M_colDimNames = new Array();
var M_rowDimNames = null;
var M_otherDimNames = null;


// IE and NN use different attributes for style class names.
var M_className = PWdsapp_bBrowserClassname ? "className" : "class";

// IE provides innerText which is faster than innerHTML, if available.
var M_innerAttr = PWdsapp_bIsIE ? "innerText" : "innerHTML";	// IE vs NN

var M_emptyCell = PWdsapp_bIsIE ? " " : "&nbsp;";	// IE vs NN

// The following variables are HTML elements that are cloned to create the table.
var M_summaryImage;
	// This is an object that represents the summary image displayed for row and column item labels.
var M_dataCellContent;
	// This is the content of an empty data cell.

// This is an object that represents a blank space.
var M_blankSpace;

// Footnotes and Missing Values
var M_aastrFootnotes = new Array();      // Footnotes
var M_missingValues = new Array();  // MissingValues
var M_bFootnotes = false;
var M_bMissingValues = false;
var M_cellNotes = "";               // Current Cell Notes 
var M_currentCell;                  // Current Cell Object
var M_popupOffset = 5;              // Distance from Cell to Popup Box
var M_boundary = 5;                 // Distance from Popup Box to screen boundaries
var M_copyPopupBox;                 // Copy of Div Element for resetting onmouseout
var M_copyCurrentCellClass;         // Copy of Class Attribute of Current Cell for resetting onmouseout
var M_timeoutID = 0;                // Timeout ID returned from setTimeout()
var M_timeoutDelay = 500;           // Amount of time to delay before popping up the Cell Notes

// Printable Version Variables
var M_isPrintableVersion = false;    
var M_titleTableHeight = 0;         // Height of Title Table
var M_otherDimTableHeight = 0;      // Height of the Other Dimensions Table
var M_sourceInfoTableHeight = 0;    // Height of the Source Info Table

var M_printableHeight = 0;          
var M_printableWidth = 0;           
var M_pixelsPerInch = 80;           // High resolution screens range from 80-85 ppi, so we take the smaller one.
var M_paperTypeCount = 8;           // A3, A4, A5, B5, Letter, Legal, Executive, Tabloid

var M_conversionFactor = PWdsapp_bIsIE ? 10/9 : 1;   // Difference between the screen and what a typical printer actually prints
                                                    // TBD: This may be different for horizontal vs vertical, but is currently being
                                                    //      applied to both equally.

// Hard-code the paper sizes in inches (1 inch = 2.54 cm)
// M_paperSizes[type][0] = width in portrait mode
// M_paperSizes[type][1] = height in portrait mode
var M_paperSizes = new Array();
for (type = 0; type < M_paperTypeCount; type++) {
	M_paperSizes[type]= new Array();
}
// A3 - 297mm x 420mm
M_paperSizes[0][0] = 29.7 / 2.54;
M_paperSizes[0][1] = 42 / 2.54;
// A4 - 210mm x 297mm
M_paperSizes[1][0] = 21 / 2.54;
M_paperSizes[1][1] = 29.7 / 2.54;
// A5 - 148mm x 210mm
M_paperSizes[2][0] = 14.8 / 2.54;
M_paperSizes[2][1] = 21 / 2.54;
// B5 - 176mm x 250mm
M_paperSizes[3][0] = 17.6 / 2.54;
M_paperSizes[3][1] = 25 / 2.54;

// Letter - 8.5 x 11 
M_paperSizes[4][0] = 8.5;
M_paperSizes[4][1] = 11;
// Legal - 8.5 x 14
M_paperSizes[5][0] = 8.5;
M_paperSizes[5][1] = 14;
// Executive - 7.25 x 10.5
M_paperSizes[6][0] = 7.25;
M_paperSizes[6][1] = 10.5;
// Tabloid - 11 x 17
M_paperSizes[7][0] = 11;
M_paperSizes[7][1] = 17;



// This function will try to find a loaded chunk of table data that contains the specified row
// and column. If found, the chunk will be returned. If not found, then an attempt will be made
// to preload this chunk. This allows predictive loading of data.
function findChunk(row, col) {
	// Normalize the row and column so they are within the bounds of the current table.
	if ( row < 1 ) {
		row = 1;
	}
	if (row > vScroll.getItems()) {
		row = vScroll.getItems();
	}
	if ( col < 1 ) {
		col = 1;
	}
	if (col > hScroll.getItems()) {
		col = hScroll.getItems();
	}

	// Try to find an appropriate chunk and return it if found.
	for( var i = 0; i < M_tableChunks.length; i++ ) {
		var chunk = M_tableChunks[ i ];
		if (chunk.firstRow <= row && row <= chunk.lastRow && chunk.firstCol <= col && col <= chunk.lastCol) {
			return chunk;
		}
	}

	// Attempt to preload the chunk which will contain the specified row and column.
	loadChunk(row, col);

	return null;
}

// This function is called whenever the table size is needed. It will determine how many
// rows and columns can be added, or need to be deleted, to make the table fill the window.
function getTableSize(i_tableFirstRow, i_tableFirstCol, o_tableSize) {
	var newhvis = hScroll.getVisible();
	if (newhvis < 1) {
		newhvis = 1;
	}
	else if (newhvis > (M_tableColCount - i_tableFirstCol)) {
		newhvis = M_tableColCount - i_tableFirstCol;
	}
	var newvvis = vScroll.getVisible();
	if (newvvis < 1) {
		newvvis = 1;
	}
	else if (newvvis > (M_tableRowCount - i_tableFirstRow)) {
		newvvis = M_tableRowCount - i_tableFirstRow;
	}

	o_tableSize.colCount = newhvis;
	o_tableSize.rowCount = newvvis;

	return;
}

// This function sets the scroll bars' sizes.
function setScrollBarsSize(io_tableSize) {
	var isVerticalScroll = false;
	var isHorizontalScroll = false;
	var vTop = vScroll.getTop();
	var hTop = hScroll.getTop();
	
	if ((vTop + io_tableSize.rowCount < vScroll.getItems()) || ((vTop > 0) && (vTop + io_tableSize.rowCount == vScroll.getItems()))) {
		isVerticalScroll = true;
	}

	if ((hTop + io_tableSize.colCount < hScroll.getItems())
			|| ((hTop > 0) && (hTop + io_tableSize.colCount == hScroll.getItems())))
	{ 
		isHorizontalScroll = true;
	}

	// If there is a vertical scroll bar...
	if (isVerticalScroll) {
		// ...set its width...
		M_vScrollBarCell.style.width = vScroll.imageWidth + "px";
		io_tableSize.vScrollWidth = vScroll.imageWidth;
		if (isHorizontalScroll) {
			// ...if there is also a horizontal scroll bar, set the row span to 1...
			M_vScrollBarCell.rowSpan = 1;
		}
		else {
			// ...otherwise, set it to 2 so that it spans the data table cell and the cell
			// containing the horizontal scroll bar.
			M_vScrollBarCell.rowSpan = 2;
		}
	}
	else {
		// If there is no vertical scroll bar, set it's cell's width and height to 0.
		M_vScrollBarCell.style.width = "";
		M_vScrollBarCell.style.height = "";
		io_tableSize.vScrollWidth = 0;
		M_vScrollBarCell.rowSpan = 1;
	}

	// If there is a horizontal scroll bar...
	if (isHorizontalScroll) {
		// ...set its height...
		M_hScrollBarCell.style.height = hScroll.imageWidth + "px";
		io_tableSize.hScrollHeight = hScroll.imageWidth;
		if (isVerticalScroll) {
			// ...if there is also a vertical scroll bar, set the column span to 1...
			M_hScrollBarCell.colSpan = 1;
		}
		else {
			// ...otherwise, set it to 2 so that it spans the data table cell and the cell
			// containing the vertical scroll bar.
			M_hScrollBarCell.colSpan = 2;
		}
	}
	else {
		// If there is no horizontal scroll bar, set it's cell's width and height to 0.
		M_hScrollBarCell.style.height = "";
		M_hScrollBarCell.style.width = "";
		io_tableSize.hScrollHeight = 0;
		M_hScrollBarCell.colSpan = 1;
	}

	return;
}

// This function is called whenever the table size is needed. It will determine how many
// rows and columns can be added, or need to be deleted, to make the table fill the window.
function setTableSize(o_tableSize) {
	setScrollBarsSize(o_tableSize);

	// Determine the size of the window (leave a little extra space or browser
	// scroll bars may appear. Body style overflow: hidden is strongly recommended).
	var clientX;
	var clientY;
	if (window.innerWidth == undefined) {
		// IE
		clientX = document.body.clientWidth;
		clientY = document.body.clientHeight;
	}
	else {
		// NN
		clientX = window.innerWidth;
		clientY = window.innerHeight;
	}

	// Get the amount of space left over beyond the main table.
	var offsetWidth = GetOffSet(M_mainTable, OFFSET_LEFT) + getRHSWidth();
	var offsetHeight = GetOffSet(M_mainTable, OFFSET_TOP) + getBottomHeight();
	
	if (clientX > offsetWidth) {
		if (!M_isPrintableVersion) {
			o_tableSize.tableWidth = clientX - offsetWidth;
			M_dataTable.style.width = (o_tableSize.tableWidth - o_tableSize.vScrollWidth) + "px";
		}
	}
	else {
		if (M_dataTable.style.width == "") {
			o_tableSize.tableWidth = 0;
		}
		else {
			o_tableSize.tableWidth = parseInt(M_dataTable.style.width.replace("/px/gi", ""));
		}
	}
	if (clientY > offsetHeight) {
		if (!M_isPrintableVersion) {
			o_tableSize.tableHeight = clientY - offsetHeight;
			M_dataTable.style.height = (o_tableSize.tableHeight - o_tableSize.hScrollHeight) + "px";
		}
	}
	else {
		if (M_dataTable.style.height == "") {
			o_tableSize.tableHeight = 0;
		}
		else {
			o_tableSize.tableHeight = parseInt(M_dataTable.style.height.replace("/px/gi", ""));
		}
	}

	return;
}

// This function is called whenever the main window is resized. It will determine how many
// rows and columns can be added, or need to be deleted, to make the table fill the window.
function Resize() {
	if (ObjWdsForm.CS_InHelp.value == "True") {
		return;
	}

   if (PWdsapp_bIsIE) {
		document.body.style.cursor = "wait";
	}

	if (M_currentCell != undefined) {
		HideCellNotes( M_currentCell );
	}

	ResizeOtherBar();

	hideScrollBars();
	refreshTable();
	if (!M_isPrintableVersion) {
		showScrollBars();
	}
	else {
		// In the case of the printable version, we want Resize() to be called only once.
		// Resize() is called by createChunk(), and when we resize the Browser window, but we
		// don't want it to be called when the Browser window is resized, because it will try
		// to regenerate the table.
		document.body.setAttribute("onresize", "", 0);
	}
}

// This function returns the number of row item headers that appear on the current row.
function countRowHeaders() {
	var headerCount;
	var dimIndex;

	headerCount = 0;
	for (dimIndex = 0; dimIndex < M_rowDimCount - 1; dimIndex++) {
		if (M_rowSpanCounts[dimIndex] == 0) {
			headerCount++;
		}
	}
	// +1 for the nested dimension
	headerCount++;
	
	return headerCount;
}

// This function will set the spans on the item headers on a row of the table.
// i_rowCells is an array containing the cells of the row.
// The number of nesting item headers on the row is returned.
function setRowSpans(i_rowCells) {
	var headerCount;
	var dimIndex;

	headerCount = 0;
	for (dimIndex = 0; dimIndex < M_rowDimCount - 1; dimIndex++) {
		if (M_rowSpanCounts[dimIndex] == 0) {
			cell = i_rowCells[headerCount];
			cell.setAttribute(M_className, M_rowHeaderClass, 0);
			cell.setAttribute("rowspan", M_rowLabelSpans[dimIndex][M_rowSpanIndexes[dimIndex]], 0);
			headerCount++;
		}
		M_rowSpanCounts[dimIndex] += 1;
		if (M_rowSpanCounts[dimIndex] >= M_rowLabelSpans[dimIndex][M_rowSpanIndexes[dimIndex]]) {
			M_rowSpanIndexes[dimIndex] += 1;
			M_rowSpanCounts[dimIndex] = 0;
		}
	}
	// remove the rowspan of the most nested dimension
	i_rowCells[headerCount].setAttribute("rowspan", "1", 0);
	
	return;
}

// This function removes all the child nodes of i_clElement.
function RemoveAllChildNodes(i_clElement) {
	var nIndex;

	if (i_clElement != undefined) {
		for (nIndex = i_clElement.childNodes.length - 1; nIndex >= 0; nIndex--) {
			i_clElement.removeChild(i_clElement.childNodes[nIndex]);
		}
	}
}

// This function appends a data cell (<TD>) to the specified row.
function AppendDataCell(i_row) {
	var cell;
	var emptyCellContent;
	
	cell = i_row.insertCell(i_row.cells.length);
	emptyCellContent = M_dataCellContent.cloneNode(true);
	cell.appendChild(emptyCellContent);
}

// This function creates a table header cell (<TH>) with the specified class.
function CreateItemHeaderCell(i_strClass) {
	var cell;
	var anchorTag;
	
	cell = document.createElement("TH");
	cell.setAttribute(M_className, i_strClass, 0);
	anchorTag = document.createElement("A");
	anchorTag[M_innerAttr] = M_emptyCell;
	cell.appendChild(anchorTag);
	
	return cell;
}

// This function will resize the HTML table to be the correct number of rows and columns.
function resizeTable(i_colLabelSpans, i_rowLabelSpans) {
	var c;
	var r;
	var dataRow;
	var row;
	var colCount;
	var rowCount;
	var visibleCols;
	var currentCols;
	var visibleRows;
	var colsToDel;
	var colsToAdd;
	var cell;
	var cells;
	var cellCount;
	var rowSpanIndexes;
	var rowSpanCounts;
	var cellIndex;
	var colsToDelete;
	var rowIndex;
	var maxIndex;
	var tableCols;
	var tableRows;
	var rows = M_dataTable.rows;
	var headerCount;
	var emptyCellContent;
	var replaceCellContent = false;
	var rowFirstCell;

	tableRows = rows.length - 1 - M_colDimCount; // skip dimension headers and scroll bar
	if (tableRows < 0) {
		tableCols = 0;
	}

	if (rows.length > M_colDimCount) {
		// The number of columns on the row containing the most nested dimension's item headers,
		// -1 to skip the column dimension header.
		tableCols = rows[M_colDimCount - 1].cells.length - 1;
	}
	else {
		tableCols = 0;
	}

	// Shrink/grow table rows

	// Update existing rows for nesting dimensions
	visibleRows = vScroll.getVisible();
	if (M_rowDimCount > 1) {
		for (r = 0; r < M_rowDimCount - 1; r++) {
			M_rowSpanIndexes[r] = 0;
			M_rowSpanCounts[r] = 0;
		}

		rowCount = Math.min(visibleRows, tableRows);
		for (r = 0; r < rowCount; r++) {
			// (r + M_colDimCount + 1) to skip column and row dimension headers
			row = rows[r + M_colDimCount + 1];
			cells = row.cells;
			// Count how many item headers there is room for in this row,
			// excluding the most nested dimension's item header
			colsToDelete = cells.length - tableCols - 1;
			headerCount = countRowHeaders(cells);
			colsToDelete -= headerCount - 1;
			if (colsToDelete < 0) {
				// There aren't enough columns, add some.
				rowFirstCell = cells[0];
				for (c = colsToDelete; c < 0; c++) {
					cell = CreateItemHeaderCell(M_rowHeaderClass);
					row.insertBefore(cell, rowFirstCell);
				}
			}
			else if (colsToDelete > 0) {
				// There are too many columns, remove them.
				for (c = 0; c < colsToDelete; c++) {
					row.deleteCell(0);
				}
			}
			setRowSpans(cells);
		}
	}

	if (visibleRows < tableRows) {
		// Shrink table by rows
		maxIndex = visibleRows + M_colDimCount + 1;
		for (rowIndex = rows.length - 1; rowIndex >= maxIndex; rowIndex--) {
			M_dataTable.deleteRow(rowIndex);
		}
	}
	else if (visibleRows > tableRows) {
		// Grow table by rows
		var cols = rows[M_colDimCount - 1].cells.length - 1;
		maxIndex = visibleRows + M_colDimCount + 1;
		for (rowIndex = rows.length; rowIndex < maxIndex; rowIndex++) {
			row = M_dataTable.insertRow(rowIndex);
			// insert nesting dimensions' row item headers
			for (c = 0; c < M_rowDimCount - 1; c++) {
				if (M_rowSpanCounts[c] == 0) {
					cell = CreateItemHeaderCell(M_rowHeaderClass);
					cell.setAttribute("rowspan", i_rowLabelSpans[c][M_rowSpanIndexes[c]], 0);
					row.appendChild(cell);
				}
				M_rowSpanCounts[c] += 1;
				if (M_rowSpanCounts[c] >= i_rowLabelSpans[c][M_rowSpanIndexes[c]]) {
					M_rowSpanIndexes[c] += 1;
					M_rowSpanCounts[c] = 0;
				}
			}
			// insert nested dimension's row item headers
			cell = CreateItemHeaderCell(M_rowHeaderClass);
			row.appendChild(cell);
			for (i = 1; i <= cols; i++) {
				AppendDataCell(row);
			}
		}
	}

	// Shrink/grow table columns
	// use (M_colDimCount - 1) to get the row containing the most nested dimension item headers.
	var sortAnchorTag;
	var sortArrowAscending;
	var sortArrowDescending;
	for (r = 0; r < M_colDimCount; r++) {
		currentCols = rows[r].cells.length - 1;
		if (r < M_colDimCount - 1) {
			// nesting column dimensions
			visibleCols = i_colLabelSpans[r].length;
		}
		else {
			// most nested column dimension
			visibleCols = hScroll.getVisible();
		}
		if (visibleCols < currentCols) {
			// Shrink table by columns.
			colsToDel = currentCols - visibleCols;
			row = rows[r];
			for (var c = 0; c < colsToDel; c++) {
				row.deleteCell(row.cells.length - 1);
				if (r >= M_colDimCount - 1) {
					// This is the most nested column dimension, so delete the columns in the cell data rows.
					// There are 2 rows for this dimension, so delete the columns for the second row as well
					// (that's why we use the "<=" in the while loop below).
					i = 0;
					while (i <= visibleRows) {
						// (+ M_colDimCount + 1) to skip column and row headers
						dataRow = rows[i + M_colDimCount];
						cellIndex = dataRow.cells.length - 1;
						dataRow.deleteCell(cellIndex);
						i++;
					}
				}
			}
            if (r < M_colDimCount - 1) {
				// if this is a nesting dimension, set the colspan of each column.
				for (c = 0; c < visibleCols; c++) {
					row.cells[c + 1].setAttribute("colspan", i_colLabelSpans[r][c], 0);
				}
			}
		}
		else { //if (visibleCols > currentCols)
			// Grow table by columns.
			var cell;
			var col;
			colsToAdd = visibleCols - currentCols;
			if (r < M_colDimCount - 1) {
				// if the dimension is a nesting dimension, then update the span of existing columns
				for (col = 0; col < currentCols; col++) {
					cell = rows[r].cells[col + 1];
					cell.setAttribute("colspan", i_colLabelSpans[r][col], 0);
				}
			}
			for (col = 1; col <= colsToAdd; col++) {
				row = rows[r];
				// add headers
				cell = CreateItemHeaderCell(M_colHeaderClass);
				row.appendChild(cell);
				if (r < M_colDimCount - 1) {
					// this is a nesting dimension
					cell.setAttribute("colspan", i_colLabelSpans[r][currentCols + col - 1], 0);
				}
				else {
					cell.style.borderBottomStyle = "none";
					// if this is the most nested column dimension, then it
					// has a row containing the sort arrows.
					row = rows[r + 1];
					cell = document.createElement("TH");
					row.appendChild(cell);
					cell.setAttribute(M_className, M_colHeaderSortClass, 0);
 					// This is required to add the borders on the Printable Version
 					//it also should be done for percent views
 					cell[M_innerAttr] = M_emptyCell;

					// Loop doing other rows (cell data rows)
					i = 0;
					while (i < vScroll.getVisible()) {
						//  i + M_colDimCount + 1 to skip column and row headers
						row = rows[i + M_colDimCount + 1];
						AppendDataCell(row);
						i++;
					}
				}
			}
		}
		// Add icons for sorting
		var anColDims = ObjWdsForm.sWD_Cols.value.split(",");
		var nInnerColDim = anColDims[anColDims.length - 1];
		var nColSpan = ObjWdsForm.sWD_SelectedItemsCount.value.split(",")[nInnerColDim];
		tableCols = rows[M_colDimCount - 1].cells.length - 1;
		for (col = 0; col < tableCols; col++) {
			cell = rows[M_colDimCount].cells[col + M_rowDimCount];
			var nColPosition = cell.cellIndex;
			var nTop = hScroll.getTop();
			var sortArrows = cell.getElementsByTagName("A");
			
			if (!M_isPrintableVersion
				&& (M_totalPrctType != M_rowPercent) 
				&& (M_totalPrctType != M_colPercent))
			{
				if (sortArrows.length == 0) {
					// Add the 'sort ascending' arrow
					sortAnchorTag = document.createElement("A");
					sortArrowAscending = document.createElement("IMG");
					sortArrowAscending.setAttribute("src", M_strSortAscendingArrow, 0);
					sortArrowAscending.setAttribute("border", "0", 0);
					sortArrowAscending.setAttribute("title", resSortAsc, 0);
					sortArrowAscending.setAttribute("alt", resSortAsc, 0);
					sortArrowAscending.setAttribute("width", "13", 0);
					sortArrowAscending.setAttribute("height", "14", 0);
					sortAnchorTag.appendChild(sortArrowAscending);
					cell.appendChild(sortAnchorTag);

					// Add the 'sort descending' arrow
					sortAnchorTag = document.createElement("A");
					sortArrowDescending = document.createElement("IMG");
					sortArrowDescending.setAttribute("src", M_strSortDescendingArrow, 0);
					sortArrowDescending.setAttribute("border", "0", 0);
					sortArrowDescending.setAttribute("title", resSortDesc, 0);
					sortArrowDescending.setAttribute("alt", resSortDesc, 0);
					sortArrowDescending.setAttribute("width", "13", 0);
					sortArrowDescending.setAttribute("height", "14", 0);
					sortAnchorTag.appendChild(sortArrowDescending);
					cell.appendChild(sortAnchorTag);
				}  
			}
		}
	}
}

// Sets the vertical and horizontal scroll position form fields to a value of 1.
function resetSavedScrollPosition() {
	CreateHiddenFormField(ObjWdsForm, "sWD_FirstRow", 0);
	CreateHiddenFormField(ObjWdsForm, "sWD_FirstCol", 0);
	CreateHiddenFormField(ObjWdsForm, "sWD_DataFirstRow", 1);
	CreateHiddenFormField(ObjWdsForm, "sWD_DataFirstCol", 1);
}

// Save the vertical and horizontal scroll positions to form fields.
function saveScrollPosition() {
	ObjWdsForm.sWD_FirstRow.value = vScroll.getTop();
	ObjWdsForm.sWD_FirstCol.value = hScroll.getTop();

	ObjWdsForm.sWD_DataFirstRow.value = M_tlChunk.firstRow;
	ObjWdsForm.sWD_DataFirstCol.value = M_tlChunk.firstCol;
}	

// Retrieve the vertical scroll position from a form field.
function getSavedVScrollPosition() {
	return parseInt(ObjWdsForm.sWD_FirstRow.value);
}

// Retrieve the horizontal scroll position from a form field.
function getSavedHScrollPosition() {
	return parseInt(ObjWdsForm.sWD_FirstCol.value);
}

// Retrieves the sort order from a form field.  Returns 0 for descending, 1 for ascending.
function getSortOrder() {
	if (typeof(ObjWdsForm.sWD_SortAscending) != 'undefined') {
		return ("True" == ObjWdsForm.sWD_SortAscending.value);
	}
	return false;
}

// This function is called to sort data along a column. 
function onSortData(i_nColumnIndex, i_bAscending) {
	saveScrollPosition();
	CreateHiddenFormField(ObjWdsForm, "WD_Command", "SortData");
	CreateHiddenFormField(ObjWdsForm, "WD_SortColumn", i_nColumnIndex);
	CreateHiddenFormField(ObjWdsForm, "WD_SortAscending", i_bAscending);
	ObjWdsForm.action = G_strTableView;
	executeWait(ObjWdsForm);
}

function getSortColumn() {
	return (typeof(ObjWdsForm.sWD_SortColumn) == 'undefined') ? -1 : parseInt(ObjWdsForm.sWD_SortColumn.value);
}

// This function returns true if a column is sorted and false otherwise.
// If it returns true, it fills io_sortedItemsCodes with the item codes of the item that is sorted
// and the codes of the items that nest it.
function getSortedItemCodes(io_sortItemCodes) {
	var index;
	var bIsSorted;
	var viewSortCode;
	var viewSortCode;
	var sortItemCodes;

	var nSortColumn = getSortColumn();
	if (nSortColumn == -1) {
		bIsSorted = false;
	}
	else {
		// FIXME: 
		viewSortCode = ObjWdsForm.sWD_ViewSortCode.value;
		// get the item codes only, not the dimension names
		viewSortCode = viewSortCode.split(M_sortSectionSep)[1];
		sortItemCodes = viewSortCode.split(M_sortItemSep);
		for (index = 0; index < M_colDimCount; index++) {
			io_sortItemCodes[index] = sortItemCodes[index];
		}
		bIsSorted = true;
	}

	return bIsSorted;
}

// This function returns true if one of the columns on the screen is sorted and false otherwise.
// If it returns true, the member of o_sortedItemsIndex is set to the index of the sorted column.
//
// i_sortItemCodes: an array containg the item codes (one for each column dimension) of the sorted
//    column.
// i_lChunk: the top-left chunk
// i_rChunk: the top-right chunk
// i_firstColIndexes: an array of indexes into the top-left chunk.  There is one index for each one
//    of the column dimensions.  Each index represents the first item that is displayed on the screen
//    for a dimension.  (this array is obtained from a call to getColSpans()).
// i_colSpans: an array of arrays of column spans.  There is one array for each column dimension.  Each
//    one of these arrays contains the span of each item on the screen.
//    (this array is obtained from a call to getColSpans()).
// i_columnCount: the number of columns on the screen.
// o_sortedColumnIndex: a structure that will hold the index of the sorted column.
function getSortedColumnIndex(
	i_sortItemCodes,
	i_lChunk,
	i_rChunk,
	i_firstColIndexes,
	i_colSpans,
	i_columnCount,
	o_sortedColumnIndex
	)
{
	var chunk;
	var itemCode;
	var itemIndex = -1;
	var index;
	var colIndex;
	var hasSortedColumn;
	var dim;
	var currentDimItemIndexes; 
		// an array containing the index into the colIDs array of a chunk, one index for each
		// column dimension
	
	var nestingDimColCount; // An array that is used to keep track of the current column count for each
	                        // dimension so that we know when to increment the indexes based on the colspans

    var adjustedColIndex;   // The colIndex is the absolute index of item.  We need to adjust it because 
                            // we use this to index a zero-based array (i_colSpans) that only deals with what 
                            // is currently on the screen.

	currentDimItemIndexes = new Array(i_firstColIndexes.length);
	for (index = 0; index < currentDimItemIndexes.length; index++) {
		currentDimItemIndexes[index] = i_firstColIndexes[index];
	}

    // Initialize the column counters for the nesting dimensions
    nestingDimColCount = new Array(currentDimItemIndexes.length - 1);
	for (index = 0; index < nestingDimColCount.length; index++) {
	    nestingDimColCount[index] = 0;
	}
	// start with the left chunk.
	chunk = i_lChunk;
	hasSortedColumn = false;
	// check each column to see if it is sorted. stop once the sorted column is found
	for (colIndex = 0; colIndex < i_columnCount && !hasSortedColumn; colIndex++) {
		dim = M_colDimCount - 1;
		itemCode = chunk.colIDs[dim][currentDimItemIndexes[dim]];
		if (itemCode == i_sortItemCodes[dim]) {
			itemIndex = colIndex;
			hasSortedColumn = true;
			// The item code of the nested dimension matches the one of the sorted column,
			// check the item codes for the nesting dimensions
			for (dim = dim - 1; dim >= 0 && hasSortedColumn; dim--) {
				itemCode = chunk.colIDs[dim][currentDimItemIndexes[dim]];
				if (itemCode != i_sortItemCodes[dim]) {
					hasSortedColumn = false;
				}
			}
		}
		if (!hasSortedColumn) {
			// if the sorted column is not found, increment the current item indexes
			for (dim = 0; dim < currentDimItemIndexes.length; dim++) {
				if (dim == currentDimItemIndexes.length - 1) {
					// always increment the index for the nested dimension
					currentDimItemIndexes[dim]++;
				}
				else {
					nestingDimColCount[dim]++;
					// Adjust the column index so that it represents its position on the screen (zero-based).
					adjustedColIndex = currentDimItemIndexes[dim] - i_firstColIndexes[dim];
					if (i_colSpans[dim][adjustedColIndex] <= (nestingDimColCount[dim])) {
						// only increment the index for the nesting dimensions if we have
						// reached the end of the span for the item at the current index.
						currentDimItemIndexes[dim]++;

						// reset the column counter for this dimension
						nestingDimColCount[dim] = 0;
					}
				}
			}
			// Check to see if we've reached the end of the chunk.  
			// Since i_firstColIndexes range from 0 -> M_colsPerChunk - 1, we need to adjust the value 
			// based on the first column index in the chunk and our current position on the screen.
			if ((i_firstColIndexes[i_firstColIndexes.length - 1] + (chunk.firstCol - 1) + colIndex) == chunk.lastCol - 1) {
				// this is the end of the left chunk, use the right chunk
				chunk = i_rChunk;
				for (index = 0; index < currentDimItemIndexes.length; index++) {
					currentDimItemIndexes[index] = 0;
				}
			}
		}
	}
	if (hasSortedColumn) {
		o_sortedColumnIndex.m_index = itemIndex;
	}

	return hasSortedColumn;
}

// This function changes the specified sort arrow with the provided image.
// i_sortArrow: an element containing an IMG element representing the sort arrow.
// i_imagePath: path of the image that will be used to replace the existing arrow
// i_imageText: text used in "alt" and "title" attributes of the <img> tag.
function changeSortArrow(i_sortArrow, i_imagePath, i_imageText) {
	var sortArrowImage = i_sortArrow.getElementsByTagName("img");
	sortArrowImage[0].setAttribute("src", i_imagePath, 0);
	sortArrowImage[0].setAttribute("title", i_imageText, 0);
	sortArrowImage[0].setAttribute("alt", i_imageText, 0);
}

// This function updates the sort arrow images and corresponding text of the
// specified column (i_colIndex).
//
// i_colIndex: index of the column being updated
// i_sortedColInfo: index and sort order of column that is sorted; index is -1 if sorted column is not visible
// i_prevSortedColInfo: index and sort order of previously sorted column (used after scrolling to reset the arrow);
//		to a non-sorted state); index is -1 if not such column exists.
// i_bIsSortedColOnPage: true if the sorted column is on the page (in other words, if it is visible)
// i_sortArrows: an array of 2 elements, each containing an <IMG> tag representing a sort arrow.
//		the first element contains the ascending arrow, the other one the descending arrow.
function updateSortArrows(
	i_colIndex,
	i_sortedColInfo,
	i_prevSortedColInfo,
	i_bIsSortedColOnPage,
	i_sortArrows
	)
{
	if (i_bIsSortedColOnPage) {
		if (i_colIndex == i_sortedColInfo.m_index) {
			// The current column is sorted, change its arrow to the sorted arrow
			if (i_sortedColInfo.m_order == 0) {
				// sorted descending
				changeSortArrow(i_sortArrows[1], M_strSortDescendingArrowActive, resSortReset);
			}
			else {
				// sorted ascending
				changeSortArrow(i_sortArrows[0], M_strSortAscendingArrowActive, resSortReset);
			}
		}
		else {
			// The current column was sorted but is no longer sorted.  Change its
			// arrow to the non-sorted arrow.
			if (i_prevSortedColInfo.m_order == 0) {
				// sorted descending
				changeSortArrow(i_sortArrows[1], M_strSortDescendingArrow, resSortDesc);
			}
			else {
				// sorted ascending
				changeSortArrow(i_sortArrows[0], M_strSortAscendingArrow, resSortAsc);
			}
		}
	}
	else if (i_colIndex == i_prevSortedColInfo.m_index) {
		// The current column was sorted but is no longer sorted. Change its
		// arrow to the non-sorted arrow.
		if (i_prevSortedColInfo.m_order == 0) {
			// sorted descending
			changeSortArrow(i_sortArrows[1], M_strSortDescendingArrow, resSortDesc);
		}
		else {
			// sorted ascending
			changeSortArrow(i_sortArrows[0], M_strSortAscendingArrow, resSortAsc);
		}
	}
}

// This function adds a sort arrow to a sorted column in the Printable Version
function addSortArrowPrintable(i_sortOrder, i_currentNode) {

		// Add the sort arrow 
		var sortArrowCell;

		if (i_sortOrder == 1) {
			// Sort Ascending
			sortArrowCell = document.getElementById("AscendingArrow");
		}
		else if (i_sortOrder == 0) {
			// Sort Descending
			sortArrowCell = document.getElementById("DescendingArrow");
		}
		// replace the current node
		i_currentNode.parentNode.replaceChild(sortArrowCell, i_currentNode);
}

// This function resizes and refills the table to be scrolled to the appropriate point.
// If i_forceUpdate is true, the table is updated (refilled) even if it does not need to be.
// If i_forceUpdate is false, the table is updated only if it needs to be (when the scroll
// bar positions have changed, when the table can be resized to occupy more of the Browser window)
// The possible return values are:
//		M_Update_Updated - The table was updated.
//		M_Update_WaitingForData	- The table was not updated because not enough data chunks were available.
function updateTable(i_forceUpdate, i_newTableSize) {
	if (M_oldRowCounts == null)
		return; //sanity check in case the page hasn't finished loading

	var vtop = vScroll.getTop();
	var htop = hScroll.getTop();

	var vvis = i_newTableSize.rowCount;
	var hvis = i_newTableSize.colCount;
	var tableRowsIncreased = false;
	var tableRowsDecreased = false;
	var tableColsIncreased = false;
	var tableSizeIncreased = false;
	var bSpawnWindow = false;

	var dimIndex;

	bSpawnWindow = IsSpawnWindow();

	if (i_forceUpdate) {
		M_startInBottomChunk = false;
		M_startInRightChunk = false;
		for (dimIndex = 0; dimIndex < M_rowDimCount; dimIndex++) {
			M_oldRowCounts[dimIndex] = 0;
			M_doesRowLabelSpanChunks[dimIndex] = false;
		}
		for (dimIndex = 0; dimIndex < M_colDimCount; dimIndex++) {
			M_oldColCounts[dimIndex] = 0;
			M_doesColLabelSpanChunks[dimIndex] = false;
		}
	}
	else {
		for (dimIndex = 0; dimIndex < M_rowDimCount - 1; dimIndex++) {
			M_oldRowCounts[dimIndex] = M_rowLabelSpans[dimIndex].length;
		}		
		M_oldRowCounts[dimIndex] = vScroll.getVisible();
		
		for (dimIndex = 0; dimIndex < M_colDimCount - 1; dimIndex++) {
			M_oldColCounts[dimIndex] = M_colLabelSpans[dimIndex].length;
		}		
		M_oldColCounts[dimIndex] = hScroll.getVisible();
	}

	if (vvis > M_oldRowCounts[M_rowDimCount - 1]) {
		tableRowsIncreased = true;
	}
	else if (vvis < M_oldRowCounts[M_rowDimCount - 1]) {
		tableRowsDecreased = true;
	}
	if (hvis > M_oldColCounts[M_colDimCount - 1]) {
		tableColsIncreased = true;
	}
	if (tableRowsIncreased || tableColsIncreased) {
		tableSizeIncreased = true;
	}

	// Find the (up to) 4 chunks of the table which may be displayed at this time.
	// Also, try to find the next pages of data so that they will be preloaded by the
	// time they are needed.

	// Visible table data relates to chunks as follows.

	// abcd
	// eFGh
	// iJKl
	// mnop

	// The visible data could straddle 4 chunks (FGJK). There are 8 chunks that could be needed within one
	// page scroll (bcehilno). The last 4 chunks (admp) can not be scrolled to with a single scroll (requires
	// at least 1 page in both horizontal and vertical directions.

	// Find the four chunks that this page could possibly cover (FGJK).
	var tlChunk;
	var trChunk;
	var blChunk;
	var brChunk;

	if (i_forceUpdate) {
		M_tlChunk = findChunk( vtop + 1, htop + 1 );				// F
	}
	if (i_forceUpdate || tableColsIncreased) {
		M_trChunk = findChunk( vtop + 1, htop + hvis + 1 );		// G
	}
	if (i_forceUpdate || tableRowsIncreased) {
		M_blChunk = findChunk( vtop + vvis + 1, htop + 1 );		// J
	}
	if (i_forceUpdate || tableSizeIncreased) {
		M_brChunk = findChunk( vtop + vvis + 1, htop + hvis + 1 );// K
	}

	// Prefetch chunks which may be visible when scrolling by a page in any direction (bcehilno).
	if (i_forceUpdate || tableRowsIncreased) {
		findChunk( vtop - vvis + 1, htop + 1 );					// b
		findChunk( vtop + 2 * vvis + 1, htop + 1 );				// n
	}
	if (i_forceUpdate || tableColsIncreased) {
		findChunk( vtop + 1, htop - hvis + 1 );					// e
		findChunk( vtop + 1, htop + 2 * hvis + 1 );				// h
	}
	if (i_forceUpdate || tableSizeIncreased) {
		findChunk( vtop - vvis + 1, htop + hvis + 1 );			// c
		findChunk( vtop + vvis + 1, htop - hvis + 1 );			// i
		findChunk( vtop + vvis + 1, htop + 2 * hvis + 1 );		// l
		findChunk( vtop + 2 * vvis + 1, htop + hvis + 1 );		// o
	}

	// Ignore the unreachable chunks (admp).

	// If any of the 4 chunks that are in this page are missing,
	// defer refreshing until the data is available.
	if ((M_tlChunk == null) ||
		(M_trChunk == null) ||
		(M_blChunk == null) ||
		(M_brChunk == null))
	{
		M_refreshNeeded = true;
		return M_Update_WaitingForData;
	}

	// If there are enough items that scroll bars must be shown,
	// fix the size of the table to fill the screen (prevents jumping).
	hScroll.setVisible(i_newTableSize.colCount);
	vScroll.setVisible(i_newTableSize.rowCount);

	for (dimIndex = 0; dimIndex < M_rowDimCount; dimIndex++) {
		M_firstRowLabelIndexesOld[dimIndex] = M_firstRowLabelIndexes[dimIndex];
	}
	for (dimIndex = 0; dimIndex < M_colDimCount; dimIndex++) {
		M_firstColLabelIndexesOld[dimIndex] = M_firstColLabelIndexes[dimIndex];
	}

	// calculate the span of nesting column dimension labels
	getColSpans(0, M_tlChunk, M_trChunk, hScroll.getVisible(), M_colLabelSpans, M_firstColLabelIndexes);

	// On the first pass through, M_firstColLabelIndexes provides us with the index of the 
	// first column on the screen.  On subsequent iterations through this function, it is 
	// updated to provide the index of the first column (not printed) to the right of the screen.  
	// For determining which column to change the sort arrows on, we require the former, therefore
	// M_firstColLabelIndexesForSorting is only set the first time through.
	if (i_forceUpdate) {
		for (dimIndex = 0; dimIndex < M_colDimCount; dimIndex++) {
			M_firstColLabelIndexesForSorting[dimIndex] = M_firstColLabelIndexes[dimIndex];
		}
	}

	// calculate the span of nesting row dimension labels
	getRowSpans(0, M_tlChunk, M_blChunk, vScroll.getVisible(), M_rowLabelSpans, M_firstRowLabelIndexes);

	// Resize the table.  The top-left, top-right and bottom-left chunks are required to insert the column
	// and row item headers of nesting dimensions.
	resizeTable(M_colLabelSpans, M_rowLabelSpans);

	var increaseCount;
	if (!i_forceUpdate) {
		var switchedToTopChunk = false;
		// Set the first row and column indexes to their old value, accounting for a decrease in size.
		for (dimIndex = M_rowDimCount - 1; dimIndex >= 0; dimIndex--) {
			M_firstRowLabelIndexes[dimIndex] = M_firstRowLabelIndexesOld[dimIndex];
			// calculate the number of rows by which the table has increased/decreased.
			if (dimIndex < M_rowDimCount - 1) {
				increaseCount = M_rowLabelSpans[dimIndex].length - M_oldRowCounts[dimIndex];
			}
			else {
				increaseCount = vScroll.getVisible() - M_oldRowCounts[dimIndex];
			}
			if (increaseCount < 0) {
				// The number of rows has decreased, so we must decrement the label index. 
				M_firstRowLabelIndexes[dimIndex] += increaseCount;
				if (dimIndex == (M_rowDimCount - 1)) {
					// If this is the most nested dimension...
					if (M_firstRowLabelIndexes[dimIndex] < 0) {
						// ...and the index is negative, then we have to move to the top chunk
						// and calculate the label index accordingly
						switchedToTopChunk = true;
						M_startInBottomChunk = false;
						M_firstRowLabelIndexes[dimIndex] += M_tlChunk.rowLabels[dimIndex].length;
					}
				}
				else {
					// If this is a nesting dimension...
					if (switchedToTopChunk) {
						// ... and if we have to switch to the top chunk, then we have to
						// calculate the label index accordingly.
						M_firstRowLabelIndexes[dimIndex] += M_tlChunk.rowLabels[dimIndex].length;
						if (M_doesRowLabelSpanChunks[dimIndex]) {
							// If a label spanned the 2 chunks (it is the last label of the top chunk
							// and first label of the bottom chunk), then it counts as 1 label we have to
							// remove one more.
							M_firstRowLabelIndexes[dimIndex]--;
						}
					}
				}
				// M_firstRowLabelIndexes will be modified when we update the rowumn labels,
				// but we need the original values for updating the cell values of each row.
				// So store the original values into M_firstRowLabelIndexesOld.
				M_firstRowLabelIndexesOld[dimIndex] = M_firstRowLabelIndexes[dimIndex];
			}
		}
		var switchedToLeftChunk = false;
		for (dimIndex = M_colDimCount - 1; dimIndex >= 0; dimIndex--) {
			M_firstColLabelIndexes[dimIndex] = M_firstColLabelIndexesOld[dimIndex];
			// calculate the number of columns by which the table has increased/decreased.
			if (dimIndex < M_colDimCount - 1) {
				increaseCount = M_colLabelSpans[dimIndex].length - M_oldColCounts[dimIndex];
			}
			else {
				increaseCount = hScroll.getVisible() - M_oldColCounts[dimIndex];
			}
			if (increaseCount < 0) {
				// The number of columns has decreased, so we must decrement the label index. 
				M_firstColLabelIndexes[dimIndex] += increaseCount;
				if (dimIndex == (M_colDimCount - 1)) {
					// If this is the most nested dimension...
					if (M_firstColLabelIndexes[dimIndex] < 0) {
						// ...and the index is negative, then we have to move to the left chunk
						// and calculate the label index accordingly
						switchedToLeftChunk = true;
						M_startInRightChunk = false;
						M_firstColLabelIndexes[dimIndex] += M_tlChunk.colLabels[dimIndex].length;
					}
				}
				else {
					// If this is a nesting dimension...
					if (switchedToLeftChunk) {
						// ... and if we have to switch to the left chunk, then we have to
						// calculate the label index accordingly.
						M_firstColLabelIndexes[dimIndex] += M_tlChunk.colLabels[dimIndex].length;
						if (M_doesColLabelSpanChunks[dimIndex]) {
							// If a label spanned the 2 chunks (it is the last label of the left chunk
							// and first label of the right chunk), then it counts as 1 label we have to
							// remove one more.
							M_firstColLabelIndexes[dimIndex]--;
						}
					}
				}
				// M_firstColLabelIndexes will be modified when we update the column labels,
				// but we need the original values for updating the cell values of each row.
				// So store the original values into M_firstColLabelIndexesOld.
				M_firstColLabelIndexesOld[dimIndex] = M_firstColLabelIndexes[dimIndex];
			}
		}
	}

	var bHasSortedCol = false;
	var bIsSortedColOnPage = false;
	var sortedColInfo = new SortInfo();
	
	sortedColInfo.m_index = getSortColumn();
	if (sortedColInfo.m_index != -1) {
		bHasSortedCol = true;
		bIsSortedColOnPage = true;
		sortedColInfo.m_order = getSortOrder();
	}

	var quoteRegExp = /'/gi;
	var escapedItemCode;
	var cell;
	var selMembersCall;
	var summaryHandler;
	var summaryImage;
	var blankSpace;
	var tableRows = M_dataTable.rows;
	var cells;
	var c;
	var sortIndex;
	var dim;
	var colsLeft;
	var colCount;
	var firstCol;
	var visibleCount;
	var sortArrowCells;
	var sortArrows;
	var sortHandler;
	var sortItemIdentifier;
	var tChunk;
	var colLabelIndex;
	var usingRightChunks;
	var dimLabelCount;
	var childIndex;
	var childCount;
	var childNodes;
	var labelNode;
	var isRowCustomGroup;
	var isColCustomGroup;
	var startCol;

	// Update the column labels, using the cells in the top left chunk first.
	for (dim = 0; dim < M_colDimCount; dim++) {
		if (M_startInRightChunk) {
			tChunk = M_trChunk;
			usingRightChunk = true;
		}
		else {
			tChunk = M_tlChunk;
			usingRightChunk = false;
			dimLabelCount = M_tlChunk.colLabels[dim].length;
		}
		dimLabelCount = tChunk.colLabels[dim].length;
		cells = tableRows[dim].cells;
		if (dim < M_colDimCount - 1) {
			// nesting dimensions
			visibleCount = cells.length - 1; // -1 to skip dimension headers
		}
		else {
			// nested dimension
			visibleCount = hvis;
			sortArrowCells = tableRows[dim + 1].cells;
		}
		for (c = M_oldColCounts[dim]; c < visibleCount; c++) {
			if (!usingRightChunk) {
				// Check if we need to switch to the top-right chunk.
				if (M_firstColLabelIndexes[dim] >= dimLabelCount) {
					// Since we will be using another chunk, we must reset the label indexes for each dimension.
					if (dim < M_colDimCount - 1) {
						M_doesColLabelSpanChunks[dim] = doesLabelSpanChunks(tChunk, M_trChunk, false, dim);
						if (M_doesColLabelSpanChunks[dim]) {
							// For nesting dimensions, the last label in the top-left chunk might be the same as
							// the first label in the top-right chunk.  In this case, the index of the next label
							// to use (in the top-right chunk) is 1, not 0...except for the case where there is only
							// one label.
							lastIndex = M_trChunk.colLabels[dim].length - 1;
							M_firstColLabelIndexes[dim] = Math.min(1, lastIndex);
						}
						else {
							M_firstColLabelIndexes[dim] = 0;
						}
					}
					else {
						// If this is the most nested dimension, then the labels don't
						// span other nested labels, so set the index to 0.
						M_firstColLabelIndexes[dim] = 0;
					}

					tChunk = M_trChunk;
					usingRightChunk = true;
				}
			}
			// c + 1 to skip the row header cell.
			cell = cells[c + 1];
			labelNode = cell;
			colLabelIndex = M_firstColLabelIndexes[dim];
			if (tChunk.colIsGroup[dim][colLabelIndex]) {
				if (!M_isPrintableVersion) {
						// Add a "A" tag for the link.
					if (cell.childNodes[0].tagName != "A") {
						anchorTag = document.createElement("A");
						anchorTag[M_innerAttr] = "&nbsp;";
						cell.replaceChild(anchorTag,cell.childNodes[0]);
					}
					labelNode = cell.childNodes[0];
					if (M_displayGroupLinks) {
						selMembersCall = "javascript:OnSelectChildren(" + M_colDimIDs[dim] + "," + tChunk.colIDs[dim][colLabelIndex] + ");";
						labelNode.setAttribute("href", selMembersCall, 0);
					}
				}
				else {
					labelNode.style.textDecoration = "underline";
				}
			}
			else {
				if (cell.childNodes[0].tagName == "A") {
					var aTextNode = document.createTextNode(" ");
					cell.replaceChild(aTextNode,cell.childNodes[0]);
					labelNode = cell;
				}
			}
			var strLabel = tChunk.colLabels[dim][colLabelIndex];
			if (TrimWhiteSpace(strLabel) == "") strLabel = '\xA0';
			labelNode.firstChild.data = strLabel;

    		if (labelNode.firstChild.data.length == 0) {
    			labelNode[M_innerAttr] = M_emptyCell;
    		}
    		
			if (!M_isPrintableVersion) {
				// add/remove summary image
				childNodes = cell.childNodes;
				childCount = childNodes.length;
				if (tChunk.colHasSummary[dim][colLabelIndex]) {
					escapedItemCode = tChunk.colIDs[dim][colLabelIndex].replace(quoteRegExp, "\\'");
					summaryHandler = "javascript:OnTableViewItemSummary(";
					summaryHandler += M_colDimIDs[dim];
					summaryHandler += ",";
					summaryHandler += escapedItemCode;
					summaryHandler += ");";
					if (childCount == 1) {
						// only create the summary image if it's not already there
						summaryImage = M_summaryImage.cloneNode(true);						
						blankSpace = M_blankSpace.cloneNode(true);
						cell.appendChild(blankSpace);
						cell.appendChild(summaryImage);
					}
					else {
						summaryImage = childNodes[2];
					}
					summaryImage.setAttribute("href", summaryHandler, 0);
				}
				else {
					for (childIndex = childCount - 1; childIndex > 0; childIndex--) {
						cell.removeChild(childNodes[childIndex]);
					}
				}
			}
			// Set the sort arrow handlers
			if (sortArrowCells != undefined) {
    			cell = sortArrowCells[c + M_rowDimCount];
				if (!M_isPrintableVersion) {
					sortArrows = cell.getElementsByTagName("A");
					if (sortArrows.length > 1) {
						var nAbsoluteColIndex = tChunk.firstCol - 1 + colLabelIndex;
						sortHandler = "javascript:onSortData(" + nAbsoluteColIndex + ",1)";
						sortArrows[0].setAttribute("href", sortHandler, 0);
						sortHandler = "javascript:onSortData(" + nAbsoluteColIndex + ",0)";
						sortArrows[1].setAttribute("href", sortHandler, 0);
						if (bHasSortedCol) {
			    			// change the image and corresponding alt text if the column is sorted
							updateSortArrows(nAbsoluteColIndex, sortedColInfo, M_sortedColInfo, bIsSortedColOnPage, sortArrows);
						}
					}
				}
				else {
					// We don't show the sort arrow when percentages are applied.
					if (M_totalPrctType != M_rowPercent && M_totalPrctType != M_colPercent) {
    					if (bHasSortedCol && c == sortedColInfo.m_index) {
	    					// add in the sorted arrow
		    				addSortArrowPrintable(sortedColInfo.m_order, cell);
    					}   
    				}
				}
			}
			M_firstColLabelIndexes[dim]++;
		}
	}
	M_startInRightChunk = usingRightChunk;

	if (bIsSortedColOnPage) {
		M_sortedColInfo.m_index = sortedColInfo.m_index;
		M_sortedColInfo.m_order = sortedColInfo.m_order;
	}

	var lChunk;
	var rChunk = M_trChunk;

	var headerCount;
	var vOffset;
	var hOffset;

	var rowData;
	var rowNotes;
	var rowStart;
	var colStart;
	var colIsRowCustomGroup;
	var cellData;
	var cellNotes;
	var cellNoteData;
	var hasFootnotes;
	var dataIndex;
	var usingRightChunkCells;

	if (hvis > M_oldColCounts[M_colDimCount - 1]) {
		rowStart = 0;
		M_startInBottomChunk = false;
	}
	else {
		rowStart = M_oldRowCounts[M_rowDimCount - 1];
		for (dimIndex = 0; dimIndex < M_rowDimCount; dimIndex++) {
			M_firstRowLabelIndexes[dimIndex] = M_firstRowLabelIndexesOld[dimIndex];
		}
	}
	var lastIndex;
	// For all of the rows in the body of the table
	if (rowStart < vvis) {
		if (M_startInBottomChunk) {
			lChunk = M_blChunk;
		}
		else {
			lChunk = M_tlChunk;
		}
		vOffset = vtop - lChunk.firstRow + 1;
		for (var r = rowStart; r < vvis; r++) {
			isColCustomGroup = false;
			// If we have gone past the bottom of the top chunks, reset to continue with the bottom chunks.
			if (!M_startInBottomChunk) {
				if (r + vtop >= lChunk.lastRow) {
					for (dim = 0; dim < M_rowDimCount; dim++) {
						// Since we will be using another chunk, we must reset the label indexes for each dimension.
						if (dim < M_rowDimCount - 1) {
							if (doesLabelSpanChunks(lChunk, M_blChunk, true, dim)) {
								// For nesting dimensions, the last label in the top-left chunk might be the same as
								// the first label in the bottom-left chunk.  In this case, the index of the next label
								// to use (in the bottom-left chunk) is 1, not 0...except for the case where there is only
								// one label.
								lastIndex = M_blChunk.rowLabels[dim].length - 1;
								M_firstRowLabelIndexes[dim] = Math.min(1, lastIndex);
							}
							else {
								M_firstRowLabelIndexes[dim] = 0;
							}
						}
						else {
							// If this is the most nested dimension, then the labels don't
							// span other nested labels, so set the index to 0.
							M_firstRowLabelIndexes[dim] = 0;
						}
					}

					lChunk = M_blChunk;
					rChunk = M_brChunk;

					vOffset = vtop - lChunk.firstRow + 1;
					
					M_startInBottomChunk = true;
				}
			}
		
			// Update the cells in the left chunk
			rowData = lChunk.rowData[r + vOffset];
			rowNotes = lChunk.rowNotes[r + vOffset];
			
			// We're only concerned with items of the most nested dimension.
			isColCustomGroup = lChunk.rowIsColCustomGroup[M_rowDimCount - 1][r + vOffset];

			// r + M_colDimCount to skip the dimension headers
			cells = tableRows[r + M_colDimCount + 1].cells;

			// Write the row item headers
			// headerCount is the number of dimension item headers in the row
			headerCount = cells.length - hvis;
			if (r >= M_oldRowCounts[M_rowDimCount - 1]) {
				// We are updating a new row, so we have to update all the cell values of the row.
				colStart = 0;
				hOffset = htop - lChunk.firstCol + 1;
			}
			else {
				// We are updating an existing row, so we need to update only the cell values
				// of the new columns.
				colStart = M_oldColCounts[M_colDimCount - 1];
				hOffset = M_firstColLabelIndexesOld[M_colDimCount - 1];
			}

			// Update the row item headers only if rows have been removed or added.
			// We can't do this only for the new rows because adding a row or removing a row
			// can affect the span of existing item headers.
			if (tableRowsDecreased || tableRowsIncreased) {
				for (c = 0; c < headerCount; c++) {
					dimIndex = M_rowDimCount - headerCount + c;
					cell = cells[c];
					cell.style.paddingLeft = "";
					labelNode = cell;
					if (lChunk.rowIsGroup[dimIndex][M_firstRowLabelIndexes[dimIndex]]) {
						if (!M_isPrintableVersion) {
							// Add a "A" tag for the link.
							var anchorTag = cell.getElementsByTagName("A");
							if (cell.childNodes[0].tagName != "A") {
								anchorTag = document.createElement("A");
								anchorTag[M_innerAttr] = "&nbsp;";
								cell.replaceChild(anchorTag,cell.childNodes[0]);
							}
							labelNode = cell.childNodes[0];
							if (M_displayGroupLinks) {
								selMembersCall = "javascript:OnSelectChildren(" + M_rowDimIDs[dimIndex] + "," + lChunk.rowIDs[dimIndex][M_firstRowLabelIndexes[dimIndex]] + ");";
								labelNode.setAttribute("href", selMembersCall, 0);
							}
						}
						else {
							labelNode.style.textDecoration = "underline";
						}
					}
					else {
						if (cell.childNodes[0].tagName == "A") {
							var aTextNode = document.createTextNode(" ");
							cell.replaceChild(aTextNode,cell.childNodes[0]);
							labelNode = cell;
						}
					}
					labelNode.firstChild.data = lChunk.rowLabels[dimIndex][M_firstRowLabelIndexes[dimIndex]];
					if (labelNode.firstChild.data.charAt(0) == ' ') {
						var nSpaces = 0;
						var nLength = labelNode.firstChild.data.length;
						for (i = 0; i < nLength; i++) {
							if (labelNode.firstChild.data.charAt(i) == ' ') {
								nSpaces++;
							}
							else break;
						}
						cell.style.paddingLeft = nSpaces.toString() + "em";
					}
					if (TrimWhiteSpace(labelNode.firstChild.data).length == 0) {
						labelNode[M_innerAttr] = M_emptyCell;
					}
					if (!M_isPrintableVersion) {
						// add/remove summary image
						childNodes = cell.childNodes;
						childCount = childNodes.length;
						if (lChunk.rowHasSummary[dimIndex][M_firstRowLabelIndexes[dimIndex]]) {
							summaryHandler = "javascript:OnTableViewItemSummary(";
							escapedItemCode = lChunk.rowIDs[dimIndex][M_firstRowLabelIndexes[dimIndex]];
							summaryHandler += M_rowDimIDs[dimIndex];
							summaryHandler += ",";
							summaryHandler += escapedItemCode;
							summaryHandler += ");";
							if (childCount == 1) {
								// Only add a new summary image if it's not already there
								summaryImage = M_summaryImage.cloneNode(true);								
								blankSpace = M_blankSpace.cloneNode(true);
								cell.appendChild(blankSpace);
								cell.appendChild(summaryImage);
							}
							else {
								summaryImage = childNodes[2];
							}
							summaryImage.setAttribute("href", summaryHandler, 0);
						}
						else {
							for (childIndex = childCount - 1; childIndex > 0; childIndex--) {
								cell.removeChild(childNodes[childIndex]);
							}
						}
					}
					M_firstRowLabelIndexes[dimIndex] += 1;
				}
			}

			// write the cell data for the row
			usingRightChunkCells = false;
				// There is only a 'Total' for the most nested dimension.
			colIsRowCustomGroup = lChunk.colIsRowCustomGroup[M_colDimCount - 1];
			for (dataIndex = hOffset, c = colStart; c < hvis; dataIndex++, c++) {
				if (!usingRightChunkCells) {
					if (c + htop >= lChunk.lastCol) {
						// If there are cells in the right chunk, update them as well.
						rowData = rChunk.rowData[r + vOffset];
						rowNotes = rChunk.rowNotes[r + vOffset];
						colIsRowCustomGroup = rChunk.colIsRowCustomGroup[M_colDimCount - 1];
						dataIndex = c + htop - lChunk.lastCol;
						usingRightChunkCells = true;
					}
				}

				isRowCustomGroup = false;
				hasFootnotes = false;
				cellData = rowData[dataIndex];
				cellNotes = rowNotes[dataIndex];
				currentCell = cells[c + headerCount];
				if (!isColCustomGroup) {
					// Check if there is a row total.
					isRowCustomGroup = colIsRowCustomGroup[dataIndex];
				}

				// If there are footnotes or missing values we need to set the attribute for onmouseover.
				if (cellNotes != "") {
					// Set mouseover handler.
					if (cellNotes.charAt(0) != M_footnoteMissingValSep) {
						// If the first character is not the character that separates the footnotes
						// identifiers from the missing value identifier, then there are footnotes
						// for this cell.
						hasFootnotes = true;
					}
					if (!M_isPrintableVersion) {
						cellNoteData = "javascript:DisplayCellNotes('";
						cellNoteData = cellNoteData + cellNotes + "', this);";

						// if Netscape then OK to use the standard setAttribute otherwise we use a workaround
						// for IE
						if (PWdsapp_bIsIE) {
							currentCell["onmouseover"] = new Function("DisplayCellNotes('" + cellNotes + "', this);");
							currentCell["onmouseout"] = new Function("HideCellNotes(this);");
						}
						else {
							currentCell.setAttribute("onmouseover", cellNoteData, 0);
							currentCell.setAttribute("onmouseout", "javascript:HideCellNotes(this)", 0);
						}
					}
				}

				// Because we reuse the same cells, we need to clear any mouseover event handler that
				// was set in a previous update of the table.
				else {
					// Clear mouseover handler.
					if (PWdsapp_bIsIE) {
						currentCell["onmouseover"] = "";
						currentCell["onmouseout"] = "";
					}
					else {
						currentCell.setAttribute("onmouseover", "", 0);
						currentCell.setAttribute("onmouseout", "", 0);
					}
				}
				
				//Set or clear the style of total cells and colored cells.
				SetDataCellStyle(currentCell, (isColCustomGroup || isRowCustomGroup), cellNotes)

				var tempCellData = TrimWhiteSpace(cellData);
				var currentCellContent = currentCell.childNodes[0];

				if (hasFootnotes) {
					// If the cell has footnotes, use .innerHTML because there is an "&nbsp;"
					// in the string.  We have 2 separate cases here because using .innerHTML
					// is a lot slower than using childNodes[0].data, but we have to use it because
					// of the &nbsp;.
					currentCellContent.innerHTML = cellData;
				}
				else if (tempCellData.length == 0) {
					currentCellContent[M_innerAttr] = M_emptyCell;
				}
				else {
					currentCellContent.firstChild.data = cellData;
				}
			}
		}
		for (dimIndex = 0; dimIndex < M_rowDimCount; dimIndex++) {
			if (M_firstRowLabelIndexes[dimIndex] > lChunk.rowLabels[dimIndex].length) {
				M_firstRowLabelIndexes[dimIndex] = lChunk.rowLabels[dimIndex].length;
			}
		}
		for (dimIndex = 0; dimIndex < M_colDimCount; dimIndex++) {
			if (M_firstColLabelIndexes[dimIndex] > lChunk.colLabels[dimIndex].length) {
				M_firstColLabelIndexes[dimIndex] = lChunk.colLabels[dimIndex].length;
			}
		}
	}

	// If Printable Version, we want to create and display the 
	// footnotes and missing values.
	if ((M_isPrintableVersion) && (i_forceUpdate)) {
		if ((M_bFootnotes) || (M_bMissingValues)) {
			createCellNoteTables();
		}
	}

	// setTableSize() has to be called resizeTable() may have changed the size of the table
	// (removed rows, columns) and this sometimes changes the property "offsetTop" of M_mainTable,
	// and this property is used to properly fit the table on the screen.
		setTableSize(i_newTableSize);

	return M_Update_Updated;
}

// This function sets the style of a data cell by setting/clearing the value of the
// cell's 'class' attribute.
// The value of the class attribute of a cell is set if:
//   -�the cell�contains a total OR
//   - the cell�has to be colored.
// The value of the class attribute of a cell is cleared if:
//   -�it is not the printable version AND
//   -�the cell�does not contain�a total and row or column totals are active AND
//   - the cell does not have to be colored and cell coloring is enabled.
// The value of the class attribute of a cell is not changed otherwise.
function SetDataCellStyle(
	i_cell,
	i_isCustomGroup,
	i_cellNotes
	)
{
	var cellClassName = null;
	if (i_isCustomGroup) {
		// The cell contains a total
		cellClassName = M_dataTotalClass;
	}
	else {
		// The cell does not contain a total.					
		// If custom groups are being displayed or cell coloring is enabled,
		// we need to clear the class attribute in case the user has scrolled
		// because table cells are re-used during scrolling.
		if (!M_isPrintableVersion) {
			// Because of the performance impact of using setAttribute, only clear the class name
			// for the non-printable version.
			var className = i_cell.getAttribute(M_className);
			if (className != null && className.length > 0) {
				cellClassName = "";
			}
		}
		if (M_bCellColor && (i_cellNotes != "")) {
			// If there are notes, get the position of the footnote to use to color the cell.
			var cellColorFootnote = FindCellColorFootnote(i_cellNotes);
			if (cellColorFootnote >= 0) {
				// We found a footnote to color the cell, set its class attribute,
				cellClassName = M_arCellColors[cellColorFootnote].style;
			}
		}
	}
	if (cellClassName != null) {
		if (cellClassName.length > 0) {
			// Set the cell's style if there is one.
			i_cell.setAttribute(M_className, cellClassName, 0);
		}
		else {
			i_cell.removeAttribute(M_className);
		}
	}
	
	return;
}

// This function retrieves the span of columns in the nesting column dimensions.
// It also retrieves the index of the first label to display for each column
// dimension.  This is a recursive function.
// i_dim: the dimension index (should be zero)
// i_tlChunk: top-left chunk of data
// i_trChunk: top-right chunk of data
// i_nestedColCount: number of visible columns in the most nested dimension
// io_colLabelSpans: array containing one array for each nesting column dimension.  Each of the arrays
//                   contains the span of its visible columns (labels).
// io_firstLabelIndexes: an array containg the the index of the first column label for each dimension.
function getColSpans(
	i_dim,
	i_tlChunk,
	i_trChunk,
	i_nestedColCount,
	io_colLabelSpans,
	io_firstLabelIndexes
	)
{
	var blIndex = 0;
	var colLabelIndex = 0;
	var colLabelCount = 0;
	var colSpanCount = 0;
	var totalSpan = 0;
	var foundFirstCol = false;
	var firstLabelIndex;

	if (i_dim >= M_colDimCount - 1) {
		io_firstLabelIndexes[i_dim] = hScroll.getTop() - i_tlChunk.firstCol + 1;
	}
	else {
		getColSpans(i_dim + 1, i_tlChunk, i_trChunk, i_nestedColCount,
			io_colLabelSpans, io_firstLabelIndexes);

		colLabelCount = i_tlChunk.colLabelSpans[i_dim].length;
		io_colLabelSpans[i_dim] = new Array();
		// get the span of the first label
		while (!foundFirstCol) {
			labelSpan = i_tlChunk.colLabelSpans[i_dim][colLabelIndex];
			if (colLabelIndex == colLabelCount - 1) {
				// This is the last label of the top-left chunk.  It is possible that the label
				// spans 2 chunks.  In that case, we must check if the first label of the top-right
				// chunk is the same label, and if it is we must add the two spans.
				if (i_trChunk.firstCol != i_tlChunk.firstCol) {
					// the two chunks are different chunks
					if (i_tlChunk.colLabels[i_dim][colLabelIndex]
							== i_trChunk.colLabels[i_dim][0])
					{
						// the label spans two chunks, so add the label spans together
						labelSpan += i_trChunk.colLabelSpans[i_dim][0];
						// When using the top-right chunk, we will start at index 1 instead of 0,
						// because we already used the span at index 0.
						blIndex = 1;
					}
				}
			}
			totalSpan += labelSpan;
			if (io_firstLabelIndexes[M_colDimCount - 1] < totalSpan) {
				foundFirstCol = true;
				labelSpan = totalSpan - io_firstLabelIndexes[M_colDimCount - 1];
				if (labelSpan > i_nestedColCount) {
					labelSpan = i_nestedColCount;
				}
				io_colLabelSpans[i_dim][0] = labelSpan;
				io_firstLabelIndexes[i_dim] = colLabelIndex;
				colSpanCount++;
				totalSpan = labelSpan;
			}
			colLabelIndex++;
		}
		// get the span of the other column labels
		while ((totalSpan < i_nestedColCount) && (colLabelIndex < colLabelCount)) {
			labelSpan = i_tlChunk.colLabelSpans[i_dim][colLabelIndex];
			if (colLabelIndex == colLabelCount - 1) {
				// This is the last label of the top-left chunk.  It is possible that the label
				// spans 2 chunks.  In that case, we must check if the first label of the top-right
				// chunk is the same label, and if it is we must add the two spans.
				if (i_trChunk.firstCol != i_tlChunk.firstCol) {
					// the two chunks are different chunks
					if (i_tlChunk.colLabels[i_dim][colLabelIndex]
							== i_trChunk.colLabels[i_dim][0])
					{
						// the label spans two chunks, so add the label spans together
						labelSpan += i_trChunk.colLabelSpans[i_dim][0];
						// When using the top-right chunk, we will start at index 1 instead of 0,
						// because we already used the span at index 0.
						blIndex = 1;
					}
				}
			}
			totalSpan += labelSpan;
			if (totalSpan > i_nestedColCount) {
				labelSpan = labelSpan + i_nestedColCount - totalSpan;
			}
			io_colLabelSpans[i_dim][colSpanCount] = labelSpan;
			colSpanCount++;
			colLabelIndex++;
		}
		if (totalSpan < i_nestedColCount) {
			if (colLabelIndex >= colLabelCount) {
				// continue, using the top-right chunk
				colLabelIndex = blIndex;
				colLabelCount = i_trChunk.colLabelSpans[i_dim].length;
				while ((totalSpan < i_nestedColCount) && (colLabelIndex < colLabelCount)) {
					labelSpan = i_trChunk.colLabelSpans[i_dim][colLabelIndex];
					totalSpan += labelSpan;
					if (totalSpan > i_nestedColCount) {
						labelSpan = labelSpan + i_nestedColCount - totalSpan;
					}
					io_colLabelSpans[i_dim][colSpanCount] = labelSpan;
					colSpanCount++;
					colLabelIndex++;
				}
			}
		}
	}
}

// This function determines if a label for dimension i_dim spans 2 consecutive chunks.
function doesLabelSpanChunks(
	i_chunk1,
	i_chunk2,
	i_vertical,
	i_dim
	)
{
	var spansChunks = false;
	var lastIndex;
	var labels1;
	var labels2;
	
	if (i_vertical) {
		labels1 = i_chunk1.rowLabels[i_dim];
		labels2 = i_chunk2.rowLabels[i_dim];
	}
	else {
		labels1 = i_chunk1.colLabels[i_dim];
		labels2 = i_chunk2.colLabels[i_dim];
	}
	lastIndex = labels1.length - 1;
	if (labels1[lastIndex] == labels2[0]) {
		// If the last label of the first chunk is the same as the first label of
		// the second chunk, it might span the 2 chunks...
		if (i_dim == 0) {
			// If this is the first dimension, then the label spans the 2 chunks..
			spansChunks = true;
		}
		else {
			// If this isn't the first dimension, the label could span the 2 chunks.
			// It will only span the 2 chunks if the label of its nesting dimension also spans the 2 chunks.
			spansChunks = doesLabelSpanChunks(i_chunk1, i_chunk2, i_vertical, i_dim - 1);
		}
	}

	return spansChunks;
}

// This function retrieves the span of rows in the nesting row dimensions.
// It also retrieves the index of the first label to display for each row
// dimension.  This is a recursive function.
// i_dim: the dimension index (should be zero)
// i_tlChunk: top-left chunk of data
// i_blChunk: bottom-left chunk of data
// i_nestedRowCount: number of visible rows in the most nested dimension
// io_labelSpans: array containing one array for each nesting row dimension.  Each of the arrays
//                   contains the span of its visible rows (labels).
// io_firstLabelIndexes: an array containing the index of the first row label for each dimension.
function getRowSpans(
	i_dim,
	i_tlChunk,
	i_blChunk,
	i_nestedRowCount,
	io_labelSpans,
	io_firstLabelIndexes
	)
{
	var blIndex = 0;
	var labelIndex = 0;
	var labelCount = 0;
	var spanCount = 0;
	var totalSpan = 0;
	var foundFirst = false;
	var firstLabelIndex;

	if (i_dim >= M_rowDimCount - 1) {
		io_firstLabelIndexes[i_dim] = vScroll.getTop() - i_tlChunk.firstRow + 1;
	}
	else {
		getRowSpans(i_dim + 1, i_tlChunk, i_blChunk, i_nestedRowCount,
			io_labelSpans, io_firstLabelIndexes);

		labelCount = i_tlChunk.rowLabelSpans[i_dim].length;
		io_labelSpans[i_dim] = new Array();
		// get the span of the first label
		while (!foundFirst) {
			labelSpan = i_tlChunk.rowLabelSpans[i_dim][labelIndex];
			if (labelIndex == labelCount - 1) {
				// This is the last label of the top-left chunk.  It is possible that the label
				// spans 2 chunks.  In that case, we must check if the first label of the top-right
				// chunk is the same label, and if it is we must add the two spans.
				if (i_blChunk.firstRow != i_tlChunk.firstRow) {
					// the two chunks are different chunks
					if (doesLabelSpanChunks(i_tlChunk, i_blChunk, true, i_dim)) {
						// the label spans two chunks, so add the label spans together
						labelSpan += i_blChunk.rowLabelSpans[i_dim][0];
						// When using the bottom-left chunk, we will start at index 1 instead of 0,
						// because we already used the span at index 0.
						blIndex = 1;
					}
				}
			}
			totalSpan += labelSpan;
			if (io_firstLabelIndexes[M_rowDimCount - 1] < totalSpan) {
				foundFirst = true;
				labelSpan = totalSpan - io_firstLabelIndexes[M_rowDimCount - 1];
				if (labelSpan > i_nestedRowCount) {
					labelSpan = i_nestedRowCount;
				}
				io_labelSpans[i_dim][0] = labelSpan;
				io_firstLabelIndexes[i_dim] = labelIndex;
				spanCount++;
				totalSpan = labelSpan;
			}
			labelIndex++;
		}
		// get the span of the other row labels
		while ((totalSpan < i_nestedRowCount) && (labelIndex < labelCount)) {
			labelSpan = i_tlChunk.rowLabelSpans[i_dim][labelIndex];
			if (labelIndex == labelCount - 1) {
				// This is the last label of the top-left chunk.  It is possible that the label
				// spans 2 chunks.  In that case, we must check if the first label of the top-right
				// chunk is the same label, and if it is we must add the two spans.
				if (i_blChunk.firstRow != i_tlChunk.firstRow) {
					// the two chunks are different chunks
					if (doesLabelSpanChunks(i_tlChunk, i_blChunk, true, i_dim)) {
						// the label spans two chunks, so add the label spans together
						labelSpan += i_blChunk.rowLabelSpans[i_dim][0];
						// When using the bottom-left chunk, we will start at index 1 instead of 0,
						// because we already used the span at index 0.
						blIndex = 1;
					}
				}
			}
			totalSpan += labelSpan;
			if (totalSpan > i_nestedRowCount) {
				labelSpan = labelSpan + i_nestedRowCount - totalSpan;
			}
			io_labelSpans[i_dim][spanCount] = labelSpan;
			spanCount++;
			labelIndex++;
		}
		if (totalSpan < i_nestedRowCount) {
			if (labelIndex >= labelCount) {
				// continue, using the bottom-left chunk
				labelIndex = blIndex;
				labelCount = i_blChunk.rowLabelSpans[i_dim].length;
				while ((totalSpan < i_nestedRowCount) && (labelIndex < labelCount)) {
					labelSpan = i_blChunk.rowLabelSpans[i_dim][labelIndex];
					totalSpan += labelSpan;
					if (totalSpan > i_nestedRowCount) {
						labelSpan = labelSpan + i_nestedRowCount - totalSpan;
					}
					io_labelSpans[i_dim][spanCount] = labelSpan;
					spanCount++;
					labelIndex++;
				}
			}
		}
	}
}

// This function refreshes the table to be scrolled to the appropriate point.
function refreshTable()
{
  	var updateResult;
	var done;
	
	// Save the desired top positions (may be reset by changed table sizes)
	var vTop = vScroll.getTop();
	var hTop = hScroll.getTop();
	
	// Calculate the new table size, based on the size of existing columns and rows of the table.
	var newTableSize = new TableSize();
	if (!M_isPrintableVersion) {
		getTableSize(vTop, hTop, newTableSize);
		// Don't force the main table's size. It will be set later when we have determined
		// the data table size.
		M_mainTable.style.width  = "";
		M_mainTable.style.height = "";
	}
	else{
		newTableSize.colCount = M_tableColCount;
		newTableSize.rowCount = M_tableRowCount;
	}

	// Ensure the HTML table is the correct size.
	updateResult = updateTable(true, newTableSize);
	if (updateResult == M_Update_WaitingForData) {
		return;
	}
	
	if (!M_isPrintableVersion) {
		// Remove extra rows.
		while ((newTableSize.rowCount > 1) &&
					(M_dataTable.offsetHeight + newTableSize.hScrollHeight > newTableSize.tableHeight))
		{					
			newTableSize.rowCount--;
			updateResult = updateTable(false, newTableSize);
			if (updateResult == M_Update_WaitingForData) {
				return;
			}
		}

		// Remove extra columns.
		while ((newTableSize.colCount > 1) &&
					(M_dataTable.offsetWidth + newTableSize.vScrollWidth > newTableSize.tableWidth))
		{
			newTableSize.colCount--;
			updateResult = updateTable(false, newTableSize);
			if (updateResult == M_Update_WaitingForData) {
				return;
			}
		}

		// Add extra rows.
		done = false;
		while (!done && (newTableSize.rowCount < (M_tableRowCount - vTop))) {
			// Add an extra row.
			newTableSize.rowCount++;
			updateResult = updateTable(false, newTableSize);
			if (updateResult == M_Update_WaitingForData) {
				return;
			}
			if (M_dataTable.offsetHeight + newTableSize.hScrollHeight > newTableSize.tableHeight)
			{
				// By adding an extra row, we exceeded the allowed height for the table,
				// so remove the extra rows. [if in this loop we went into the "else if"
				// condition below where we removed some columns, this might have caused the 
				// horizontal scroll bar to be required when it wasn't before, in which case
				// we need a "while" loop to remove more than one row].
				done = true;
				while ((newTableSize.rowCount > 1) &&
							(M_dataTable.offsetHeight + newTableSize.hScrollHeight > newTableSize.tableHeight))
				{
					newTableSize.rowCount--;
					updateResult = updateTable(false, newTableSize);
					if (updateResult == M_Update_WaitingForData) {
						return;
					}
				}
			}
			else if (M_dataTable.offsetWidth + newTableSize.vScrollWidth > newTableSize.tableWidth)
			{
				// By adding an extra row, we exceeded the allowed width for the table,
				// so remove the extra columns.
				while ((newTableSize.colCount > 1) &&
							(M_dataTable.offsetWidth + newTableSize.vScrollWidth > newTableSize.tableWidth))
				{
					newTableSize.colCount--;
					updateResult = updateTable(false, newTableSize);
					if (updateResult == M_Update_WaitingForData) {
						return;
					}
				}
			}
		}

		// Add extra columns.
		done = false;
		while (!done && (newTableSize.colCount < (M_tableColCount - hTop))) {
			// Add an extra column.
			newTableSize.colCount++;
			updateResult = updateTable(false, newTableSize);
			if (updateResult == M_Update_WaitingForData) {
				return;
			}
			if (M_dataTable.offsetWidth + newTableSize.vScrollWidth > newTableSize.tableWidth)
			{
				// By adding an extra column, we exceeded the allowed width for the table,
				// so remove the extra column.  [if in this loop we went into the "else if"
				// condition below where we removed some rows, this might have caused the 
				// vertical scroll bar to be required when it wasn't before, in which case
				// we need a "while" loop to remove more than one column].
				done = true;
				while ((newTableSize.colCount > 1) &&
							(M_dataTable.offsetWidth + newTableSize.vScrollWidth > newTableSize.tableWidth))
				{
					newTableSize.colCount--;
					updateResult = updateTable(false, newTableSize);
					if (updateResult == M_Update_WaitingForData) {
						return;
					}
				}
			}
			else if (M_dataTable.offsetHeight + newTableSize.hScrollHeight > newTableSize.tableHeight)
			{
				// By adding an extra column, we exceeded the allowed height for the table,
				// so remove the extra rows.
				while ((newTableSize.rowCount > 1) &&
							(M_dataTable.offsetHeight + newTableSize.hScrollHeight > newTableSize.tableHeight))
				{
					newTableSize.rowCount--;
					updateResult = updateTable(false, newTableSize);
					if (updateResult == M_Update_WaitingForData) {
						return;
					}
				}
			}
		}
	}

	if (M_isPrintableVersion) {
		setPrintablePageSize();

		// Force the table to be the size of the page.  This will 'compress'
		// the table if it exceeds the page size (rows labels and column labels
		// are wrapped).  The width is set twice because it is possible that it wasn't
		// set the first time, but after setting the height, the table columns were pushed
		// to the right, therefore increasing the width.
		if (M_dataTable.offsetWidth > M_printableWidth) {
			M_dataTable.style.width = M_printableWidth + "px";
		}
		if (M_dataTable.offsetHeight > M_printableHeight) {
			M_dataTable.style.height = M_printableHeight + "px";
		}
		if (M_dataTable.offsetWidth > M_printableWidth) {
			M_dataTable.style.width = M_printableWidth + "px";
		}

		createViewPrintablePages(M_printableHeight, M_printableWidth);
		//showTablePrintable(); TBD...
	}
	else {
		// Set the table height...
		if (newTableSize.vScrollWidth > 0) {
			// There is a vertical scroll bar (i.e. there are rows beyond the bottom
			// of the window), so extend the height of the table to meet the top edge of the
			// horizontal scroll bar, or the bottom of the window if there is no scroll bar.
			if (newTableSize.tableHeight > newTableSize.hScrollHeight) {
				M_dataTable.style.height = (newTableSize.tableHeight - newTableSize.hScrollHeight) + "px";
			}
		}
		else {
			M_dataTable.style.height = "";
		}
		M_mainTable.style.height = newTableSize.tableHeight + "px";
		
		// Set the table width...
		if (newTableSize.hScrollHeight > 0) {
			// There is a horizontal scroll bar (i.e. there are columns beyond the right
			// of the window), so extend the width of the table to meet the left edge of the
			// vertical scroll bar, or the right edge of the window if there is no scroll bar.
			if (newTableSize.tableWidth > newTableSize.vScrollWidth) {
				M_dataTable.style.width = (newTableSize.tableWidth - newTableSize.vScrollWidth) + "px";
			}
		}
		else {
			M_dataTable.style.width = "";
		}
		M_mainTable.style.width = newTableSize.tableWidth + "px";

		// debug
		// the table is now done.  Check innerHTML to see the html output.
		showTable();
	}

	if (PWdsapp_bIsIE) {
		document.body.style.cursor = "default";
	}
	if (M_bSupport508) {	
		var astrColIds;
		var astrRowIds;
		var clCell;
		var clCells;
		var clTableRows;
		var nCells;
		var nDataCols;
		var nDataRows;
		var nSpan;
		var nSpans;
		var nId = 0;
		var nIndex;
		var nRow;
		var nRows;
		var nRowSpan;
		var strClass;
		var strId;
		
		astrColIds = new Array();
		astrRowIds = new Array();
		clTableRows = M_dataTable.rows;
		nDataRows = vScroll.getVisible();
		nDataCols = hScroll.getVisible();
		nRows = nDataRows + M_colDimCount + 1;
		nCols = nDataCols + M_rowDimCount;
		for (nCol = 0; nCol < nDataCols; nCol++) {
			astrColIds[nCol] = "";
		}
		for (nRow = 0; nRow < nDataRows; nRow++) {
			astrRowIds[nRow] = "";
		}
		for (nRow = 0; nRow < M_colDimCount; nRow++) {
			clCells = clTableRows[nRow].cells;
			nCells = clCells.length;
			nIndex = 0;
			for (nCol = 1; nCol < nCells; nCol++) {
				clCell = clCells[nCol];
				strId = "a" + nId;
				clCell.id = strId;
				nId++;
				nSpans = (typeof(clCell.colSpan) == undefined) ? 1 : clCell.colSpan;
				for (nSpan = 0; nSpan < nSpans; nSpan++) {
					astrColIds[nIndex++] += strId + " ";
				}
			}
		}
		for (nRow = 0; nRow < nDataRows; nRow++) {
			clCells = clTableRows[nRow + M_colDimCount + 1].cells;
			for (nCol = 0; nCol < M_rowDimCount && nCol < clCells.length; nCol++) { //why M_rowDimCount?
				clCell = clCells[nCol];
				if (clCell.tagName != "TD") {
					strId = "a" + nId;
					clCell.id = strId;
					nId++;
					nSpans = (typeof(clCell.rowSpan) == undefined) ? 1 : clCell.rowSpan;
					for (nSpan = 0; nSpan < nSpans; nSpan++) {
						astrRowIds[nRow + nSpan] += strId + " ";
					}
				}
			}
		}
		for (nRow = 0; nRow < nDataRows; nRow++) {
			clCells = clTableRows[nRow + M_colDimCount + 1].cells;
			nCells = clCells.length;
			nColIndex = 0;
			for (nCol = 0; nCol < nCells; nCol++) {
				clCell = clCells[nCol];
				if (clCell.tagName == "TD") {
					strId = astrRowIds[nRow] + astrColIds[nColIndex++];
					clCell.setAttribute("headers", strId, 0);
				}
			}
		}
	}

	return;
}

// These functions are used to show the tooltip that gives the current row or column labels
// when the scroll thumb is being dragged faster than the table can be refreshed.
function showVerticalToolTip( x, y )
	{
	// Find the toolTip element.
	var tt = document.getElementById( "toolTip" );

	// Show the tooltip at the specified location.
	var firstShow = tt.style.visibility == "hidden";
	tt.style.visibility = "visible";

	// Update the tooltip value and position (fixing the original x position).
	tt.childNodes[ 0 ].data = rowLabelArrays[ vScroll.getTop() + 1 ];
	if ( firstShow )
		tt.origX = x;
	tt.style.left = tt.origX - ( tt.offsetWidth + 4 );
	tt.style.top  = y;
	}

function showHorizontalToolTip( x, y )
	{
	// Find the toolTip element.
	var tt = document.getElementById( "toolTip" );

	// Show the tooltip at the specified location.
	var firstShow = tt.style.visibility == "hidden";
	tt.style.visibility = "visible";

	// Update the tooltip value and position (fixing the original y position).
	tt.childNodes[ 0 ].data = colLabelArrays[ hScroll.getTop() + 1 ];
	tt.style.left = x - tt.offsetWidth;
	if ( firstShow )
		tt.origY = y;
	tt.style.top  = tt.origY - ( tt.offsetHeight + 4 );
	}

// This function is used to hide the tooltip.
function hideToolTip()
	{
	// Hide the toolTip element.
	document.getElementById( "toolTip" ).style.visibility = "hidden";
	}

// This variable is used to keep track of the data that is currently being loaded. This allows
// us to minimize the number of requests to the server (since the data would be redundant).
var beingLoaded = new Object();

// This function makes the table visible
function showTable()
{
	M_otherDimTable.style.visibility = "visible";
	M_dataTable.style.visibility = "visible";
	M_mainTable.style.visibility = "visible";
	
	if (M_isPrintableVersion) {
	    HidePleaseWait();
	}
	else {
	    document.getElementById("RetrieveData").style.visibility = "hidden";
	}
}

// This function makes the table hidden
function hideTable()
{
	M_otherDimTable.style.visibility = "hidden";
	M_dataTable.style.visibility = "hidden";
	M_mainTable.style.visibility = "hidden";
	if (M_isPrintableVersion) {
	    pleaseWait();
	}
	else {
	    document.getElementById("RetrieveData").style.visibility = "visible";
	}
}

function createEmptyText()
{
	M_blankSpace = document.createTextNode(" ");
}

function createSummaryImage()
{
	var imageTag;

	M_summaryImage = document.createElement("A");
	
	imageTag = document.createElement("IMG");
	imageTag.setAttribute("src", M_strSummaryImage, 0);
	imageTag.setAttribute("border", "0", 0);
	imageTag.setAttribute("title", M_summaryTooltip, 0);
	imageTag.setAttribute("alt", M_summaryTooltip, 0);
	
	M_summaryImage.appendChild(imageTag);
}


// This function creates an empty NOBR element that is used as the data cell content.
function createDataCellContent() {
	M_dataCellContent = document.createElement("NOBR");
	M_dataCellContent[M_innerAttr] = M_emptyCell;
}

function WarnNoPrintableData() {
	alert(resNoPrintableData);
	if (IsSpawnWindow()) {
		window.open('', '_self'); //hack to convince IE 8 to close without prompting (Mantis 986)
		window.close();
	}
	else
		window.history.back();
}


// This function is called when a new table is to be loaded
// (on body load, table change in the form or submit of the form).
function newTable(i_rowCount, i_colCount) {
	M_summaryTooltip = resItemSummary;
	var bSpawn = document.getElementsByName("sCS_SpawnWindow")[0].value == "True";
	if (bSpawn) {
		M_summaryTooltip += " " + resOpenWindow;
	}
	
	if (typeof(M_arCellColors) != "undefined") {
		M_bCellColor = true;
	}
	else {
		M_bCellColor = false;
	}

	var hScrollPos;
	var vScrollPos;
	
	if (PWdsapp_bIsIE) {
		document.body.style.cursor = "wait";
	}
	
	// Save the Printable value so that it can be used to alter behaviour elsewhere.
	if (ObjWdsForm.WD_Printable.value == "0") {
		M_isPrintableVersion = false;
	}
	else {
		M_isPrintableVersion = true;
	}

	if (M_isPrintableVersion || ((parseInt(ObjWdsForm.sWD_Permit.value) & 2) == 0)) {
		M_displayGroupLinks = false;
	}

	// show the proper waiting message (retrieving data/ please wait)
	if (M_isPrintableVersion) {
		pleaseWait();
	}
	else {
		ShowRetrievingDataMessage("OtherDimTable");
	}
	
	// Inform the scrollbars what to do when a tooltip needs to be displayed or hidden.
	// These have to be deferred until the body is loaded because the scroll bars won't
	// exist until then. newTable is called seldom enough that there is no need to work
	// on only setting them once.
//TBD: Enable scroll bar tooltip, when it is determined how the item labels will be sent to the client.
//	hScroll.showToolTip = showHorizontalToolTip;
//	hScroll.hideToolTip = hideToolTip;
//	vScroll.showToolTip = showVerticalToolTip;
//	vScroll.hideToolTip = hideToolTip;
	
	// Likewise, what to do when scrolling is needed.
	hScroll.performScroll = Resize;
	vScroll.performScroll = Resize;

	M_mainTable = document.getElementById("MainTable");
	M_dataTable = document.getElementById("DataTable");
	M_otherDimTable = document.getElementById("OtherDimTable");
	M_vScrollBarCell = document.getElementById("vScrollTD");
	M_hScrollBarCell = document.getElementById("hScrollTD");
	
	M_tableChunks = new Array();
	M_tableRowCount = i_rowCount;
	M_tableColCount = i_colCount;
	
	createSummaryImage();
	createEmptyText();
	createDataCellContent();
	
	hScrollPos = getSavedHScrollPosition();
	vScrollPos = getSavedVScrollPosition();
	
	hScroll.setTop(hScrollPos);
	vScroll.setTop(vScrollPos);
	
	// If we call loadChunk directly, the "Retrieving Data..." message doesn't get displayed.
	// This seems to be because the function loadChunk() is being processed and there isn't time
	// to display this message.  By using the setTimeout() function, this script has time to end and
	// display the message before loadChunk() is called.
	var strLoadChunk = "loadChunk(" + String(vScrollPos + 1) + "," + String(hScrollPos + 1) + ");";
	setTimeout(strLoadChunk, 1);
}

// This function loads a chunk containing the specified row and column.
function loadChunk(i_nRow, i_nCol) {
	// Get the x and y positions and correct them to be within the table.
	var nRowOffset = i_nRow;
	if (nRowOffset < 1) {
		nRowOffset = 1;
	}
	else if (nRowOffset > M_tableRowCount) {
		nRowOffset = M_tableRowCount;
	}
	var nColOffset = i_nCol;
	if (nColOffset < 1) {
		nColOffset = 1;
	}
	else if (nColOffset > M_tableColCount) {
		nColOffset = M_tableColCount;
	}

	// Determine which chunk should be downloaded.
	var rowChunk = Math.floor((nRowOffset - 1) / M_rowsPerChunk);
	var colChunk = Math.floor((nColOffset - 1) / M_colsPerChunk);
	var chunkFirstRow = Math.min(M_tableRowCount, rowChunk * M_rowsPerChunk + 1);
	var chunkFirstCol = Math.min(M_tableColCount, colChunk * M_colsPerChunk + 1);
	
	// Figure out which chunk is going to be loaded and don't try to load it again if is already being loaded.
	var rc = "x" + Math.floor((i_nCol - 1) / M_colsPerChunk) + "y" + Math.floor((i_nRow - 1) / M_rowsPerChunk);
	if (beingLoaded[ rc ] != undefined) {
		return;
	}
	beingLoaded[rc] = true;
	// Load the XML by passing the coordinates to the ASP page.
	if (!M_isPrintableVersion) {
		loadXML("getData.aspx", createChunk, chunkFirstRow, chunkFirstCol, M_rowsPerChunk, M_colsPerChunk, nRowOffset - 1, nColOffset - 1);
	}
	else {
		loadXML("getData.aspx", createChunk, chunkFirstRow, chunkFirstCol, M_rowsPrintable, M_colsPrintable, nRowOffset - 1, nColOffset - 1);
	}
}

// This function gets the XML data island and adds the data to the array of chunks.
function HandleIFrameData(i_Document) {
	if ((typeof(ObjWdsForm.sWD_ChunkFirstRow) != "undefined") && (typeof(ObjWdsForm.sWD_FirstDisplayRow) != "undefined") 
		&& (typeof(ObjWdsForm.sWD_ChunkFirstCol) != "undefined") && (typeof(ObjWdsForm.sWD_FirstDisplayCol) != "undefined"))
	{
		var nFirstRowIndex = parseInt(ObjWdsForm.sWD_ChunkFirstRow.value);
		var nFirstDisplayRow = parseInt(ObjWdsForm.sWD_FirstDisplayRow.value);
		var nFirstColIndex = parseInt(ObjWdsForm.sWD_ChunkFirstCol.value);
		var nFirstDisplayCol = parseInt(ObjWdsForm.sWD_FirstDisplayCol.value);
		var xmlDoc = i_Document.all("XMLDataIsland");
		if (xmlDoc != null) {
			createChunk(xmlDoc.XMLDocument, nFirstRowIndex, nFirstColIndex, nFirstDisplayRow, nFirstDisplayCol);
			if (!M_isPrintableVersion) {
				resetSavedScrollPosition();
			}
		}
	}
}

// This function loads the XML document from the specified URL, and when
// it is fully loaded, passes that document and the url to the specified
// handler function. This function works with any XML document
function loadXML(i_url, i_handler, i_nRow, i_col, i_nRowCount, i_colCount, i_firstDisplayRow, i_firstDisplayCol) {
	var strRequest = "";
	var xmlHttp = null;
	var url;

	// Use the standard DOM Level 2 technique, if it is supported
	if (typeof(XMLHttpRequest) != "undefined") {
		// Create a new XML request object.
		xmlHttp = new XMLHttpRequest();
	}
	// Otherwise use Microsoft's proprietary API for Internet Explorer
	else if (PWdsapp_bIsIE) {
		// Create a new XML request object.
		try
		{
			xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch( ex )
		{
			try
			{
				xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch( ex )
			{
				//alert( ex )
			}
		}
	}
	if (xmlHttp != null) {
		url = i_url + "?row=" + i_nRow + "&col=" + i_col + "&rowCount=" + i_nRowCount + "&colCount=" + i_colCount;
		// Specify a function to get called when the XML is loaded
		xmlHttp.onreadystatechange = function()
		{
			if (xmlHttp.readyState == 4) {
				i_handler(xmlHttp.responseXML, i_nRow, i_col, i_firstDisplayRow, i_firstDisplayCol);
				if (!M_isPrintableVersion) {
				    resetSavedScrollPosition();
				}
			}
		}
		xmlHttp.open("POST", url, true);
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xmlHttp.setRequestHeader("Accept-Language", G_strLanguage);
		strRequest = CreateHttpRequest(ObjWdsForm);
		xmlHttp.send(strRequest);
	}
	else {
		if (PWdsapp_bIsIE && !PWdsapp_bActiveXEnabled) {
			alert(resEnableActiveX);
		}
	}
}

function DisplayError(i_clErrorTag) {
	var errorNumber = i_clErrorTag[0].getAttribute("Number");
	if (errorNumber == "7016") {
		alert(resErrorItemLimit);
	}
	else {
		var strText = resErrorTypesReadingFromFile;
		var strMessage = i_clErrorTag[0].getAttribute("Message");
		if (typeof(strMessage) != "undefined" && strMessage.length > 0) {
			strText += "\r\n\r\n" + strMessage;
		}
		alert(strText);
	}
	window.history.back();
}

// This function gets the new XML data and builds a chunk structure.
// This is added to the list of chunks. If a refresh has been deferred awaiting new data,
// it will be done.
function createChunk(
	i_xmlDoc,
	i_firstRow,
	i_firstCol,
	i_firstDisplayRow,
	i_firstDisplayCol
	)
{
	var errorTag = i_xmlDoc.getElementsByTagName("Error")
	if (errorTag.length > 0) {
		DisplayError(errorTag);
		return;
	}

	// Check for errors in loading the XML (IE).
	if (i_xmlDoc.parseError && (i_xmlDoc.parseError.errorCode != 0)) {
		alert("parseError " + i_xmlDoc.parseError.reason + " (" + i_xmlDoc.parseError.errorCode + ")");
		return;
	}
		
	// Check for errors in loading the XML (NN).
	if (i_xmlDoc.documentElement == null) {
		alert(resXMLLoad);
		return;
	}

	var isFirstChunk = false;
	if (M_tableChunks.length == 0) {
		isFirstChunk = true;
	}

	if (isFirstChunk) {
		// Set the scrolling areas.
		setScrollSizes( M_tableRowCount, M_tableColCount );
		hScroll.setTop(i_firstDisplayCol);
		vScroll.setTop(i_firstDisplayRow);
	}

	var data = i_xmlDoc.getElementsByTagName("Data")[0];
	
	// Get the row, column and other labels.
	var isGroup;
	var hasSummary;
	var index;
	var dimIndex;
	var rowLabelArrays;
	var colLabelArrays;
	var otherLabelArray;
	var otherIDs;
	var otherDrillLabels;
	var otherIsGroup;
	var otherHasSummary;
	var colLabelSpans;
	var rowLabelSpans;
	var rowCount = 0;
	var colCount = 0;

	var headers = data.getElementsByTagName("Headers")[0];
	
	// Get the other dimension labels and IDs
	var otherDim;
	var otherLabel;
	var otherItemLabel;
	var dimID;
	
	var otherDims = headers.getElementsByTagName("Dim");
	var otherDimCount = otherDims.length;
	
	otherLabelArray = new Array(otherDimCount);
	otherIDs = new Array(otherDimCount);
	otherIsGroup = new Array(otherDimCount);
	otherHasSummary = new Array(otherDimCount);
	for (dimIndex = 0; dimIndex < otherDimCount; dimIndex++) {
		otherDim = otherDims[dimIndex];

		// get the dimension ID from the <OtherDimLabel> tag, only if this is the first chunk
		if (isFirstChunk) {
			dimID = otherDim.getAttribute("position");
			M_otherDimIDs[dimIndex] = parseInt(dimID);
		}

		// get the item label from the <ItemLabel> tag
		isGroup = otherDim.getAttribute("isParent");
		otherIsGroup[dimIndex] = (isGroup != null && isGroup == "true");
		hasSummary = otherDim.getAttribute("hasMemberNotes");
		otherHasSummary[dimIndex] = (hasSummary != null && hasSummary == "true");
		otherIDs[dimIndex] = otherDim.getAttribute("active");
		otherLabelArray[dimIndex] = otherDim.getAttribute("label");
	}

	// Get the column labels, IDs and spans
	var anColSpans;
	var bLastDim;
	var colDim;
	var colLabel;
	var colItemLabels;
	var colSpan;
	var colIDs;
	var colDrillLabels;
	var colIsGroup;
	var colHasSummary;
	var colIsRowCustomGroup;
	var nValidLabels;
	var rowLabelAttributes;
	var itemLabelCount;
	var dimColIsGroup;
	var dimColHasSummary;
	var dimColIsRowCustomGroup;
	var dimColLabels;
	var dimColLabelSpans;
	var customGroupType;

	var colDims = headers.getElementsByTagName("ColDim");
	var colDimCount = colDims.length;
	
	colLabelArrays = new Array(colDimCount);
	colIDs = new Array(colDimCount);
	colIsGroup = new Array(colDimCount);
	colHasSummary = new Array(colDimCount);
	colIsRowCustomGroup = new Array(colDimCount);
	colLabelSpans = new Array(colDimCount);
	
	for (dimIndex = 0; dimIndex < colDimCount; dimIndex++) {
		bLastDim = dimIndex == colDimCount - 1;
		colDim = colDims[dimIndex];
		// Get the dimension ID from the <DimLabel> tag, only if this is the first chunk
		if (isFirstChunk) {
			M_colDimIDs[dimIndex] = parseInt(colDim.getAttribute("position"));
			colLabel = colDim.getElementsByTagName("DimLabel")[0];
			if (colLabel.firstChild != null) {
				M_colDimNames[dimIndex] = colLabel.firstChild.data;
			}
			else {
				M_colDimNames[dimIndex] = " ";
			}
		}

		// get the item label and span from the <ColLabel> tag
		colItemLabels = colDim.getElementsByTagName("ColLabel");
		itemLabelCount = colItemLabels.length;
		nValidLabels = itemLabelCount;
		anColSpans = new Array(itemLabelCount);
		if (!bLastDim) {
			nValidLabels = 0;			
			for (index = 0; index < itemLabelCount; index++) {
				colLabel = colItemLabels[index];
				colSpan = colLabel.getAttribute("colspan");
				anColSpans[index] = (colSpan == null) ? 1 : parseInt(colSpan);
				if (anColSpans[index] > 0) {
					nValidLabels++;
				}
			}
			
		}
		
		dimColLabels = new Array(nValidLabels);
		dimColIDs = new Array(nValidLabels);
		dimColDrillLabels = new Array(nValidLabels);
		dimColIsGroup = new Array(nValidLabels);
		dimColHasSummary = new Array(nValidLabels);
		dimColIsRowCustomGroup = new Array(nValidLabels);
		dimColLabelSpans = new Array(nValidLabels - 1);
		
		colLabelArrays[dimIndex] = dimColLabels;
		colIDs[dimIndex] = dimColIDs;
		colIsGroup[dimIndex] = dimColIsGroup;
		colHasSummary[dimIndex] = dimColHasSummary;
		colIsRowCustomGroup[dimIndex] = dimColIsRowCustomGroup;
		colLabelSpans[dimIndex] = dimColLabelSpans;
		
		nPosition = 0;
		for (index = 0; index < itemLabelCount; index++) {
			colLabel = colItemLabels[index];
			if (anColSpans[index] > 0 || bLastDim) {
				isGroup = colLabel.getAttribute("isParent");
				dimColIsGroup[nPosition] = (isGroup != null && isGroup == "true");

				hasSummary = colLabel.getAttribute("hasNotes");
				dimColHasSummary[nPosition] = (hasSummary != null && hasSummary == "true");

				customGroupType = colLabel.getAttribute("memberType");
				dimColIsRowCustomGroup[nPosition] = (customGroupType != null && ((customGroupType == "compound") || (customGroupType == "calculated")));

				dimColIDs[nPosition] = colLabel.getAttribute("member");
				if (colLabel.firstChild != null) {
					dimColLabels[nPosition] = colLabel.firstChild.data;
				}
				else {
					dimColLabels[nPosition] = "";
				}
				// get the span of nesting dimension labels
				if (!bLastDim) {
					dimColLabelSpans[nPosition] = anColSpans[index];
				}
				nPosition++;
			}
		}
	}
	colCount = colLabelArrays[colDimCount - 1].length;

	// Get the footnote and missing value indicators and store them so 
	// that we can include them in the cells and pop-up the tooltips on mouseover
	var footnote;
	var pos;
	var footnoteLang;
	var footnotes = i_xmlDoc.getElementsByTagName("Footnote");
	var footnoteCount = footnotes.length;

	if (footnoteCount > 0) {
		M_bFootnotes = true;
	}
	for (index = 0; index < footnoteCount; index++) {
		footnote = footnotes[index];
		
		pos = footnote.getAttribute("pos");
		pos = parseInt(pos);
		// only update if it does not already exist in the array
		if (M_aastrFootnotes[pos] == null) {
			M_aastrFootnotes[pos] = new Array();
			// When the footnote indicator is displayed in HTML format, it should be encoded.
			M_aastrFootnotes[pos][0] = footnote.getAttribute("refmark");
			if (PWdsapp_bIsIE) {
				M_aastrFootnotes[pos][1] = footnote.attributes.getNamedItem("refmark").firstChild.xml;
			}
			else {
				M_aastrFootnotes[pos][1] = HTMLencode(footnote.getAttribute("refmark"));
			}
			M_aastrFootnotes[pos][2] = (footnote.firstChild == null)?"":footnote.firstChild.data;
		}
	}

	var missingValues;
	var missingValue;
	var missingValueLang;
	var missingValueCount;
	var pos;
	missingValues = i_xmlDoc.getElementsByTagName("MissingValue");
	missingValueCount = missingValues.length;
	if (missingValueCount > 0) {
		M_bMissingValues = true;
	}
	for (index = 0; index < missingValueCount; index++) {
		missingValue = missingValues[index];

		pos = missingValue.getAttribute("pos");
		pos = parseInt(pos);
		// only update if it does not already exist in the array
		if (M_missingValues[pos] == null) {
			M_missingValues[pos] = new Array();
			M_missingValues[pos][0] = missingValue.getAttribute("refmark");
			if(missingValue.firstChild == null)
				M_missingValues[pos][1] = "";
			else
				M_missingValues[pos][1] = missingValue.firstChild.data;
		}
	}

	// Get the row labels and cell values.
	var rowIndex;
	var rowLabel;
	var rowLabels;
	
	var rowDims = headers.getElementsByTagName("RowDim");
	var rowDimCount = rowDims.length;
	
	var rowDim;
	var row;
	var rowSpan;
	
	var rows = data.getElementsByTagName("Row");
	var rowCount = rows.length;
	
	var rowLabelCounts = new Array(rowDimCount);
	var cells;
	var cell;
	var rowData;
	var rowNotes;
	var footIndex;
	var rowIsGroup;
	var rowHasSummary;
	var rowIsColCustomGroup;
	var rowIDs;
	var rowDrillLabels;
	var rowLabelAttributes;
	var rowLabelCount;

	rowLabelArrays = new Array(rowDimCount);
	rowIDs = new Array(rowDimCount);
	rowIsGroup = new Array(rowDimCount);
	rowHasSummary = new Array(rowDimCount);
	rowIsColCustomGroup = new Array(rowDimCount);
	rowLabelSpans = new Array(rowDimCount - 1);
	for (index = 0; index < rowDimCount; index++) {
		rowLabelArrays[index] = new Array();
		rowIDs[index] = new Array();
		rowIsGroup[index] = new Array();
		rowHasSummary[index] = new Array();
		rowIsColCustomGroup[index] = new Array();
		rowLabelCounts[index] = 0;
		if (index < rowDimCount - 1) {	
			rowLabelSpans[index] = new Array();
		}		
		
		// get the dimension ID from the <RowDim> tag, only if this is the first chunk
		if (isFirstChunk) {
			dimID = rowDims[index].getAttribute("position");
			M_rowDimIDs[index] = parseInt(dimID);
		}
	}

	var rowDataArray = new Array(rowCount);
	var rowNotesArray = new Array(rowCount);
	var rowCellColorFootnoteArray = new Array(rowCount);
	var rowDimLabelCount;
	
	for (rowIndex = 0; rowIndex < rowCount; rowIndex++) {
		row = rows[rowIndex];
		rowLabels = row.getElementsByTagName("RowLabel")
		rowLabelCount = rowLabels.length;
		for (index = rowLabelCount - 1, dimIndex = rowDimCount - 1; index >= 0; index--, dimIndex--) {
			// get the item label and span from the <RowLabel> tag
			rowLabel = rowLabels[index];
			rowSpan = rowLabel.getAttribute("rowspan");
			var nRowSpan = (rowSpan == null) ? 1 : parseInt(rowSpan);
			if (nRowSpan > 0) {
				rowDimLabelCount = rowLabelCounts[dimIndex];
				
				isGroup = rowLabel.getAttribute("isParent");
				rowIsGroup[dimIndex][rowDimLabelCount] = (isGroup != null && isGroup == "true");

				hasSummary = rowLabel.getAttribute("hasNotes");
				rowHasSummary[dimIndex][rowDimLabelCount] = (hasSummary != null && hasSummary == "true");

				customGroupType = rowLabel.getAttribute("memberType");
				rowIsColCustomGroup[dimIndex][rowDimLabelCount] = (customGroupType != null && ((customGroupType == "compound") || (customGroupType == "calculated")));

				rowIDs[dimIndex][rowDimLabelCount] = rowLabel.getAttribute("member");
				if (rowLabel.firstChild != null) {
					rowLabelArrays[dimIndex][rowDimLabelCount] = rowLabel.firstChild.data;
				}
				else {
					rowLabelArrays[dimIndex][rowDimLabelCount] = "";
				}

				// get the span of nesting dimension labels
				if (dimIndex < rowDimCount - 1) {
					rowLabelSpans[dimIndex][rowDimLabelCount] = nRowSpan;
				}
				rowLabelCounts[dimIndex]++;
			}
		}
		
		cells = row.getElementsByTagName("C");
		cellCount = cells.length;
		rowData = new Array(cellCount);
		rowNotes = new Array(cellCount);
		rowDataArray[rowIndex] = rowData;
		rowNotesArray[rowIndex] = rowNotes;
		for (index = 0; index < cellCount; index++) {
			rowData[index] = "";  // Cell Data (Includes Footnote indicators and Data)
			rowNotes[index] = "";  // Cell Notes (Footnote and Missing Value positions for onmouseover)

			cell = cells[index];
			
			// Because of negative cell values, "nobr" is used to keep the value in one line.
			if (cell.childNodes.length > 0) {
				// There are footnotes
				footnotes = cell.getElementsByTagName("F");
				ParseCellFootnotes(footnotes, rowData, rowNotes, index);
			}

			// Check to see if this is a Missing Value.  If it is we need to add it to the Cell Note array.
			mvpos = cell.getAttribute("mv");
			if (mvpos != null) {
				// Always add a semi-colon so we can tell that it is a missing value in "onmouseover"
				// We also need the position to index the array for retrieving Identifier and Description
				rowNotes[index] = rowNotes[index].concat(M_footnoteMissingValSep, mvpos);
			}

			// Add the cell data		
			rowData[index] = rowData[index] + cell.getAttribute("f");
		}
	}
	rowCount = rowLabelArrays[rowDimCount - 1].length;

	// Find the range of data in this block of the table.
	var rowFirst = i_firstRow;
	var colFirst = i_firstCol;
	var rowLast  = rowFirst +  rowCount - 1;
	var colLast  = colFirst + colCount - 1;

	// Figure out which chunk has been loaded and ensure it is no longer on the list of chunks being loaded.
	delete beingLoaded["x" + Math.floor((colFirst - 1) / M_colsPerChunk) + "y" + Math.floor((rowFirst - 1) / M_rowsPerChunk)];

	// Create an object to hold all the chunk data.
	var newChunk = new TableChunk( rowFirst, rowLast, colFirst, colLast,
							rowLabelArrays, colLabelArrays, otherLabelArray,
							rowIDs, colIDs, otherIDs,
							rowDrillLabels, colDrillLabels, otherDrillLabels,
							rowIsGroup, colIsGroup, otherIsGroup,
							rowHasSummary, colHasSummary, otherHasSummary,
							rowIsColCustomGroup, colIsRowCustomGroup,
							rowLabelSpans, colLabelSpans, rowDataArray, rowNotesArray,
							rowCellColorFootnoteArray);

	// Add this new chunk to the chunk table.
	M_tableChunks[ M_tableChunks.length ] = newChunk;
	if (isFirstChunk) {
		setDimCountsAndClasses(rowDims.length, colDims.length);
		// If this was the first chunk of a new table, refresh the table.
		M_refreshNeeded = true;
	}
	
	// If a refresh was deferred awaiting the data, refresh now.
	if (M_refreshNeeded) {
		M_refreshNeeded = false;
		Resize();
	}
	if (M_isPrintableVersion) {
		HidePleaseWait();
	}
	else {
		RemoveRetrievingDataMessage();
	}
}

// This function parses the footnote elements (XML) of a cell.
// It creates a comma-separated list of the indicators, puts them between parentheses
// followed by &nbsp; and stores the string at index i_nCellIndex in the array i_astrFootnoteIndicators.
// It also creates a comma-separated list of footnote positions and stores the string
// at index i_nCellIndex in the array i_astrFootnotePositions.
// It also finds the footnote that will be used to color the cell and stores its position
// at index i_nCellIndex in the array i_astrCellColorFootnote.
//
// Only the indicators of the footnotes whose indicators can be shown will be added
// to the array i_astrFootnoteIndicators. If there is no such footnote, nothing will
// be written to the array.
//
// Only the position of the footnotes whose description can be shown will be added
// to the array i_astrFootnotePositions. If there is no such footnote, nothing will
// be written to the array.  This is because we need the position only to retrieve
// the indicator and description to display it in the popup window and only the
// footnotes whose description can be shown will be displayed in that window.
//
// If the cell has a footnote that will be used to color it, then its position
// 1 is written to the array.  If there is no such footnote, -1 is written to
// the array.
function ParseCellFootnotes(
	i_aclFootnoteElements,
	i_astrFootnoteIndicators,
	i_astrFootnotePositions,
	i_nCellIndex
	)
{
	var nFootIndex;
	var nPos;
	var strPos;
	var nShownIndicatorCount = 0;
	var strFootnoteIndicators = "";
	var nFootnoteCount = i_aclFootnoteElements.length;
	var anFootnotePositions = new Array(nFootnoteCount);
	
	for (nFootIndex = 0; nFootIndex < nFootnoteCount; nFootIndex++) {
		// Get the footnote position.
		strPos = i_aclFootnoteElements[nFootIndex].getAttribute("pos");
		nPos = parseInt(strPos);
		
		if (CanFootnoteIndicatorBeShown(nPos)) {
			// If the footnote indicator can be shown, add it to the end of the
			// comma-separated list of indicators.
			if (nShownIndicatorCount > 0) {
				strFootnoteIndicators = strFootnoteIndicators.concat(M_footnoteSep, M_aastrFootnotes[nPos][1]);
			}
			else {
				strFootnoteIndicators = M_aastrFootnotes[nPos][1];
			}
			nShownIndicatorCount++;
		}
		// Add the footnote position to the array.
		anFootnotePositions[nFootIndex] = nPos;
	}
	if (nShownIndicatorCount > 0) {
		// If there is at least one shown indicator, put the list between parentheses
		// and append an &nbsp;.
		strFootnoteIndicators = "(" + strFootnoteIndicators + ")&nbsp;";
	}
	i_astrFootnoteIndicators[i_nCellIndex] = strFootnoteIndicators;
	i_astrFootnotePositions[i_nCellIndex] = anFootnotePositions.join();
}


// This function finds the first footnote of that has cell-formatting
// properties from the list of footnote positions stored in the string
// It returns the footnote position if there such a footnote or -1 otherwise.
//
// i_strCellNotes: string containing a comma-separated list of footnote positions
// followed by a semi-colon followed by a missing value position.  The list of
// footnote positions may be empty and the missing value positon may not be there.
// examples: "1,3;1" , ";" , "1;2" , ";1" , "1;" , "1,2;"
function FindCellColorFootnote(
	i_strCellNotes
	)
{
	if (M_bCellColor && i_strCellNotes != "") {
		var strNotes = i_strCellNotes.split(M_footnoteMissingValSep);
		if (strNotes[0] != "") {
			var astrFootnotes = strNotes[0].split(M_footnoteSep);
			for (var pos = 0; pos < astrFootnotes.length; pos++) {
				var clFootnoteOptions;
				var nFootnotePos = parseInt(astrFootnotes[pos]);
				clFootnoteOptions = M_arCellColors[nFootnotePos];
				if (clFootnoteOptions != null) {
					return nFootnotePos;
				}
			}
		}
	}

	return -1;
}


// This function determines if a footnote's indicator can be shown
// form the footnote's cell format properties.
function CanFootnoteIndicatorBeShown(
	i_footnotePos
	)
{
	if (!M_bCellColor) {
		return true;
	}
	else {
		var footnoteOptions = M_arCellColors[i_footnotePos];
		if (footnoteOptions == null) {
			return true;
		}
		else {
			return footnoteOptions.showIndicator;
		}
	}
}

// This function determines if a footnote's description can be shown
// form the footnote's cell format properties.
function CanFootnoteDescriptionBeShown(
	i_footnotePos
	)
{
	if (!M_bCellColor) {
		return true;
	}
	else {
		var footnoteOptions = M_arCellColors[i_footnotePos];
		if (footnoteOptions == null) {
			return true;
		}
		else {
			return footnoteOptions.showDescription;
		}
	}
}

// Sets the global count and style variables
function setDimCountsAndClasses(i_nRowDimCount, i_colDimCount) {
	var dimIndex;
	
	// Set the Dim Item Counts
	M_rowDimCount = i_nRowDimCount;
	M_colDimCount = i_colDimCount;
	
	M_rowSpanIndexes = new Array(M_rowDimCount - 1);
	M_rowSpanCounts = new Array(M_rowDimCount - 1);
	M_firstRowLabelIndexes = new Array(M_rowDimCount);
	M_firstColLabelIndexes = new Array(M_colDimCount);
	M_firstRowLabelIndexesOld = new Array(M_rowDimCount);
	M_firstColLabelIndexesOld = new Array(M_colDimCount);
	M_firstColLabelIndexesForSorting = new Array(M_colDimCount);
	M_rowLabelSpans = new Array(M_rowDimCount - 1);
	M_colLabelSpans = new Array(M_colDimCount - 1);
	M_oldRowCounts = new Array(M_rowDimCount);
	M_oldColCounts = new Array(M_colDimCount);
	M_doesRowLabelSpanChunks = new Array(M_rowDimCount - 1);
	M_doesColLabelSpanChunks = new Array(M_colDimCount - 1);
	
	for	(dimIndex = 0; dimIndex < M_rowDimCount; dimIndex++) {
		M_firstRowLabelIndexes[dimIndex] = 0;
	}
	for	(dimIndex = 0; dimIndex < M_colDimCount; dimIndex++) {
		M_firstColLabelIndexes[dimIndex] = 0;
		M_firstColLabelIndexesForSorting[dimIndex] = 0;
	}

	// Set the classes
	var table = document.getElementById("DataTable"); 
	M_rowHeaderClass = table.rows[M_colDimCount + 1].cells[0].getAttribute(M_className);
	M_colHeaderClass = table.rows[0].cells[1].getAttribute(M_className);
	M_colHeaderSortClass = table.rows[M_colDimCount].cells[M_rowDimCount].getAttribute(M_className);
	
	// Don't use the first cell of the table to determine the following classes, because sometimes the
	// first row can contain totals or percentages, and its cells will have a different style than
	// the cells of other rows.
	if (!M_isPrintableVersion) {
		M_dataTableClass = "DataTable";
		M_dataTotalClass = "DataTotal";
	}
	else {
		var printColour = ObjWdsForm.sWD_PrintColour.value;
		var printFontSize = ObjWdsForm.sWD_PrintFontSize.value;
		if (printColour == 0) {
			if (printFontSize == 0) {
				M_dataTableClass = "printableDataSmallColour";
				M_dataTotalClass = "printableDataTotalsSmallColour";
			}
			else if (printFontSize == 1) {
				M_dataTableClass = "printableDataMediumColour";
				M_dataTotalClass = "printableDataTotalsMediumColour";
			}
			else {
				M_dataTableClass = "printableDataLargeColour";
				M_dataTotalClass = "printableDataTotalsLargeColour";
			}
		}
		else {
			if (printFontSize == 0) {
				M_dataTableClass = "printableDataSmallBW";
				M_dataTotalClass = "printableDataTotalsSmallBW";
			}
			else if (printFontSize == 1) {
						M_dataTableClass = "printableDataMediumBW";
						M_dataTotalClass = "printableDataTotalsMediumBW";
			}
			else {
						M_dataTableClass = "printableDataLargeBW";
						M_dataTotalClass = "printableDataTotalsLargeBW";
			}
		}
	}
	
	eval("M_totalPrctType = parseInt(ObjWdsForm.sWD_TotalPercent.value);");
}

// Sets the timeout before calling ShowCellNotes
function DisplayCellNotes(i_CellNotes, i_CurrentCell)
{
	M_cellNotes = i_CellNotes;
	M_currentCell = i_CurrentCell;

	if (M_timeoutID != 0) {
		clearTimeout(M_timeoutID);
	}
	M_timeoutID = setTimeout("ShowCellNotes()", M_timeoutDelay);
}

// Displays the Cell Notes in a popup window after the timer has expired
// Cell Notes are passed to the DisplayCellNotes function as a string of comma-separated positions. 
// Footnotes and Missing Value lists are separated by semi-colons. 
// (ie) "0,4;1" would indicate footnotes (positions 0 and 4), missing value (position 1)
//      "1" would be only a footnote (position 1)
//      ";0" would be only a missing value (position 0)
// The position is used as the index into the appropriate array (M_aastrFootnotes or M_missingValues)
// for retrieving the Identifier and Description of the note
function ShowCellNotes() {
	// Cell Note Variables
	var cellNotes = M_cellNotes;
	var noteInd = new Array();    
	var noteDesc = new Array();
	var notePos;
	var notes = new Array();
	var noteSubstring = new Array();
	var index = 0;
	var pos = 0;
	var noteCounter = 0;

	// Get the cell notes and create the Table of Indicators and Descriptions
	notes = cellNotes.split(M_footnoteMissingValSep);

	for (index = 0; index < notes.length; index++) {
		if (notes[index]!= "") {
			noteSubstring = notes[index].split(M_footnoteSep);
			for (pos = 0; pos < noteSubstring.length; pos++) {
				notePos = noteSubstring[pos];

				// Footnote
				if (index == 0) {
					if (CanFootnoteDescriptionBeShown(notePos)) {
						noteInd[noteCounter] = "(" + M_aastrFootnotes[notePos][0] + ")";
						noteDesc[noteCounter] = M_aastrFootnotes[notePos][2];
						noteCounter++;
					}
				}
				// Missing Value
				else if (index == 1) {
					noteInd[noteCounter] = M_missingValues[notePos][0];
					noteDesc[noteCounter] = M_missingValues[notePos][1];
					noteCounter++;
				}
			}
		}
	}

	// Only display the popup box if there are footnotes to display.
	if (noteCounter > 0) {
		// Reset the TimeoutID
		M_timeoutID = 0;

		// Cell Size and Positioning Variables
		var currentCell = M_currentCell;
		var cellWidth = currentCell.offsetWidth;
		var cellHeight = currentCell.offsetHeight;
		var cellPosX = 0;
		var cellPosY = 0;
		var offsetX = 0;
		var offsetY = 0;
		var overflowY = 0;

		// Div variables
		var popupBox = document.getElementById("cellNotesBox");
		var divPaddingStyle;
		var divPadding;

		// Available screen size (in our document window)
		var docWidth;
		var docHeight;

		if ( window.innerWidth == undefined ) {
			docWidth = document.body.clientWidth - 4;	// IE 
			docHeight = document.body.clientHeight;
			divPaddingStyle = popupBox.currentStyle.paddingLeft;
			divPadding = divPaddingStyle.substr(0,divPaddingStyle.length - 2);
		}
		else {
			docWidth = window.innerWidth;	            // NN
			docHeight = window.innerHeight;
			divPaddingStyle = document.defaultView.getComputedStyle(popupBox,null);
			divPadding = parseInt(divPaddingStyle.getPropertyValue('padding-left'));
		}

		// Get the absolute position of the cell
		var currentElement = currentCell;
		while (currentElement != null) {
				cellPosX += currentElement.offsetLeft;
				cellPosY += currentElement.offsetTop;
				currentElement = currentElement.offsetParent;
		}

		//Save the Div Element here so that it can be easily reset in the HideCellNotes function
		M_copyPopupBox = popupBox.cloneNode(true);

		// We use a different style for the cell to highlight it.
		// Save the original class so that it can be reset in the HideCellNotes function
		M_copyCurrentCellClass = currentCell.getAttribute(M_className);
		currentCell.setAttribute(M_className, "CurrentCellOnPopup", 0);

		// Create the <Table> to contain the Footnote and Missing Value Data
		var cellNotesTable = document.getElementById("cellNotesTable");
		var cellNoteTR;
		var cellNoteInd;
		var cellNoteDesc;
		var noBreak;

		for (index = 0; index < noteCounter; index++) {
			cellNotesTable.insertRow(index);
			cellNotesTable.rows[index].insertCell(0);
			noBreak = document.createElement("nobr");
			noBreak.appendChild(document.createTextNode(noteInd[index]));
			cellNotesTable.rows[index].cells[0].appendChild(noBreak);
			cellNotesTable.rows[index].cells[0].align = "left";
			cellNotesTable.rows[index].cells[0].vAlign = "top";
			cellNotesTable.rows[index].insertCell(1);
			cellNotesTable.rows[index].cells[1].appendChild(document.createTextNode(noteDesc[index]));
			cellNotesTable.rows[index].cells[1].align = "left";
			cellNotesTable.rows[index].cells[1].vAlign = "top";
		}

		// Populate, format, and position the Popup box
		// We adjust the width first because any changes in these settings will affect the height.
		// Offsets are measured from the top/left of the current cell position
		var boxWidth = cellNotesTable.offsetWidth + 2*divPadding;
		var boxLeft;

		// Left side of screen   
		if (cellPosX <= (docWidth/2)) {   
			maxBoxWidth = docWidth - cellWidth - cellPosX - M_popupOffset - M_boundary - 2*divPadding;
			if (maxBoxWidth <= 0) {
				maxBoxWidth = 1; 
			}
			if (boxWidth > maxBoxWidth) {
				boxWidth = maxBoxWidth;
			}
			offsetX = M_popupOffset + cellWidth;
		}
		// Right side of screen
		else {
			maxBoxWidth = cellPosX - M_popupOffset - M_boundary - 2*divPadding;
			if (maxBoxWidth <= 0) {
				maxBoxWidth = 1; 
			}
			if (boxWidth > maxBoxWidth) {
				boxWidth = maxBoxWidth;
			}
			offsetX = offsetX - M_popupOffset - boxWidth - 2*divPadding;
		}

		boxLeft = cellPosX + offsetX;

		// Set the table width and position
		cellNotesTable.width = boxWidth;
		popupBox.style.left = boxLeft;

		// Allow the box to stretch vertically, if required
		// overflowY tells us how much to shift the box up or down
		// Note: There are different overflow and offset calculations based on current cell position
		var boxHeight = cellNotesTable.offsetHeight + 2*divPadding;
		var boxTop;
		var noOverflowHeight = 0;

		// Top half of available screen 
		if (cellPosY <= ((docHeight)/2)) {
			noOverflowHeight = ((docHeight) - cellPosY - cellHeight - M_popupOffset - M_boundary);
			overflowY = noOverflowHeight - boxHeight; 

			// only shift the box when required
			if (overflowY >= 0) {
					overflowY = 0;
			}
			offsetY = cellHeight + M_popupOffset + overflowY;
		}
		// Bottom half of available screen
		else {
			noOverflowHeight = cellPosY - M_boundary - M_popupOffset;
			overflowY = boxHeight - noOverflowHeight;

			// only shift the box when required
			if (overflowY <= 0) {
					overflowY = 0;
			}
			offsetY = overflowY - M_popupOffset - boxHeight;
		}

		boxTop = cellPosY + offsetY;
		
		// Display the message from top to bottom
		if (boxTop < 0) {
		boxTop = 0;
		}
		popupBox.style.top = boxTop;

		// Display it
		popupBox.style.visibility = "visible";
	}
}

//Hides the Popup Window used for Footnotes and Missing Values
function HideCellNotes (i_CurrentCell) {

	var popupBox = document.getElementById("cellNotesBox");
	var cellNotesTable = document.getElementById("cellNotesTable");
	var currentCell = i_CurrentCell;

	// Clear the timer
	if (M_timeoutID != 0) {
		clearTimeout(M_timeoutID);
		M_timeoutID = 0;
	}
	// Only reset the attributes if a cell note is currently being displayed
	else if (M_currentCell != undefined) {

		// Reset the class of the cell to its original style
		currentCell.setAttribute(M_className, M_copyCurrentCellClass, 0);

		// Reset the Div
		popupBox.parentNode.replaceChild(M_copyPopupBox,popupBox);
	}

	M_currentCell = undefined;

}

// This function creates the cell note tables (the legend) for the Printable Version of the table.
function createCellNoteTables() {
	var footnotesTable;
	var missingValuesTable;
	
	// Footnotes
	if (M_aastrFootnotes.length > 0) {
		footnotesTable = document.getElementById("FootnotesTable");
		footnotesTable = footnotesTable.tBodies[0];
	}
	for (index = 0; index < M_aastrFootnotes.length; index++) {
		if (M_aastrFootnotes[index]!= null) {
			footnoteOptions = null;
			if (M_bCellColor) {
				footnoteOptions = M_arCellColors[index];
			}
			noteInd = "(" + M_aastrFootnotes[index][0] + ")";
			noteDesc = M_aastrFootnotes[index][2];
			AddNoteToLegend(noteInd, noteDesc, footnotesTable, footnoteOptions);
		}
	}

	// Missing Values
	if (M_missingValues.length > 0) {
		missingValuesTable = document.getElementById("MissingValuesTable");
		missingValuesTable = missingValuesTable.tBodies[0];
	}
	for (index = 0; index < M_missingValues.length; index++) {
		if (M_missingValues[index] != null) {
			noteInd = M_missingValues[index][0];
			noteDesc = M_missingValues[index][1];
		}
		else {
			noteInd = "";
			noteDesc = "";
		}

		if (noteInd != "") {
			AddNoteToLegend(noteInd, noteDesc, missingValuesTable, null);
		}
	}
}

// This function adds new row to the footnote/missing value legend table
// of the printable version.
function AddNoteToLegend(
	i_noteIndicator, // the indicator
	i_noteDescription, // the description
	i_noteTable, // the <TABLE> element
	i_noteFormatOptions // the format options if any, null otherwise
	)
{
	var cell;
	var indicatorTable;
	var indicatorTableCell;
	var indicatorTableRow;
	var nobreak;
	var noteRow;

	// Add new cell note row to the legend (the <TBODY> element of the legend table)
	noteRow = document.createElement("TR");
	i_noteTable.appendChild(noteRow);

	// Add the cell to display the note indicator.
	cell = noteRow.insertCell(0);
	
	// This cell will contain a 1-row 1-column table that will hold
	// the indicator.  We need this table in order to set the size of
	// the indicator cell.
	cell.setAttribute(M_className, "printableCellNotesIndicator", 0);
	indicatorTable = document.createElement("TABLE");
	indicatorTable.setAttribute(M_className, "printableCellNotesIndicator", 0);
	cell.appendChild(indicatorTable);
	indicatorTableRow = indicatorTable.insertRow(-1);
	indicatorTableCell = indicatorTableRow.insertCell(-1);

	// Add a <NOBR> element so that the indicator text doesn't wrap.
	noBreak = document.createElement("nobr");
	noBreak.appendChild(document.createTextNode(i_noteIndicator));
	indicatorTableCell.appendChild(noBreak);

	// Apply the appropriate styles to the note indicator cell.
	// The text and background color of this cell should be the same as 
	// the text and background colors used in the data cells of the table
	// in the printable version. 
	if (i_noteFormatOptions == null) {
		// If the note does not have cell-formatting properties and...
		if (ObjWdsForm.sWD_PrintColour.value == "0") {
			// ...the printable version is in color, use the default style,
			// the text color style and the indicator cell color background style.
			indicatorTableCell.setAttribute(M_className, "printableCellNotesIndBkColor", 0);
		}
		else {
			// ...the printable version is in black and white, use the default style
			// and the indicator cell black and white background style.
			indicatorTableCell.setAttribute(M_className, "printableCellNotesIndBkBW ", 0);
		}
	}
	else {
		// If the note has cell-formatting properties, apply the default
		// note indicator style and cell coloring style.
		indicatorTableCell.setAttribute(M_className, i_noteFormatOptions.style, 0);
	}

	// Add the cell that will contain the note description.
	cell = noteRow.insertCell(1);
	cell.appendChild(document.createTextNode(i_noteDescription));
	if (ObjWdsForm.sWD_PrintColour.value == "0") {
		// If the printable version is in color, set the text color style.
		cell.setAttribute(M_className, "printableCellNotesTextColor", 0);
	}
}

// This function creates the Printable version display of the Table.  It is called once 
// all of the data has been downloaded and put into one large HTML table.  From there,
// we determine and fix the Column Widths and Row Heights and separate the data into 
// printable pages
function createViewPrintablePages(i_maxPageHeight, i_maxPageWidth) {

	var strPageWidth = i_maxPageWidth + "px";
	var strPageHeight = i_maxPageHeight + "px";
	var colWidthArray = new Array();
	var rowHeightArray = new Array();
	var footnotesTable = document.getElementById("FootnotesTable");
	var missingValuesTable = document.getElementById("MissingValuesTable");
	var pageTable = document.getElementById("pageTable");

	// Set the position of the pageTable to absolute so that it is not part of the 
	// size calculations and does not take up any screen real-estate
	pageTable.style.position = "absolute";
	pageTable.style.left = "0px";
	pageTable.style.top = "0px";
	   
	// Create Page Template that can be cloned and reused
	var pageTemplate = createPageTemplate();
	   
	// Store the column widths as they currently appear and determine how many "data" columns 
	// can fit on each page.  Use the row with the Row Dim Headers.
	var sampleRow = M_colDimCount;
	var rawDataCells = M_dataTable.rows[sampleRow].cells;
	var totalCols = rawDataCells.length;
	var pageCols = new Array();
	var currentPageDataColCount = 0;
	var currentPageWidth = 0;
	var currentColWidth = 0;
	var headerCellWidth = 0;
	var hPages = 0;
	   
	   
	// Keep track of first column number and number of columns for each page
	pageCols[0] = new Array();
	pageCols[0][0] = M_rowDimCount;

	for (col = 0; col < totalCols; col++) {
		currentColWidth = rawDataCells[col].offsetWidth;
		colWidthArray[col] = currentColWidth;
		currentPageWidth = currentPageWidth + currentColWidth;
	      
		if (col < M_rowDimCount) {
				headerCellWidth = headerCellWidth + currentColWidth;
				if (currentPageWidth >= i_maxPageWidth) {
					WarnNoPrintableData();
					return;
				}
		}
		else{
				if (currentPageWidth >= i_maxPageWidth) {
					// Store the column count and initialize the next page
					pageCols[hPages][1] = currentPageDataColCount;
					if (currentPageDataColCount > 0) {
						currentPageWidth = headerCellWidth + currentColWidth;
						currentPageDataColCount = 1;
						pageCols[++hPages] = new Array();
						pageCols[hPages][0] = col;
					}
					else {
						WarnNoPrintableData();
						return;
					}
				}
				else{
					currentPageDataColCount++;
				}
				// Store the column count for the last horizontal page
				if (col == totalCols - 1) {
					pageCols[hPages][1] = currentPageDataColCount;
				}
		}
	}
	         
	
	// Store the row heights as they currently appear and determine how many "data" rows 
	// can fit on each page. 
	   
	var rawDataRows = M_dataTable.rows;
	var pageRows = new Array();
	var currentPageDataRowCount = 0;
	var currentPageHeight = 0;
	var currentRowHeight = 0;
	var headerCellHeight = 0;
	var vPages = 0;

	   
	var totalRows = rawDataRows.length;
	   
	// Adjust the Max Height to include the Title, Other, and Source Tables
	var maxTableHeight = i_maxPageHeight - M_titleTableHeight - M_otherDimTableHeight - M_sourceInfoTableHeight;
	   
	pageRows[vPages] = new Array();
	pageRows[vPages][0] = M_colDimCount + 1;
	
	for (row = 0; row < totalRows; row++) {
		// Because of the complexity of nested columns/rows and their associated spans, and since it
		// doesn't matter which cell we get the height from (as long as it doesn't have spans) then 
		// we can get the length of the row and subtract 2.  Subtracting only one may cause an issue 
		// when scroll bars are present and since the minimum number of columns is 2 (one for the row 
		// dimension and one for the data, indexing at zero in that case is OK, because there won't be
		// any spans.
		sampleColumn = rawDataRows[row].cells.length - 1; 
		currentRowHeight = rawDataRows[row].cells[sampleColumn].offsetHeight;

		rowHeightArray[row] = currentRowHeight;
		currentPageHeight = currentPageHeight + currentRowHeight;
	      
		if (row <= M_colDimCount) {
				headerCellHeight = headerCellHeight + currentRowHeight;
				if (currentPageHeight >= maxTableHeight) {
					WarnNoPrintableData();
					return;
				}
		}
		else{
				if (currentPageHeight >= maxTableHeight) {
					// Store the row count and initialize the next page
					pageRows[vPages][1] = currentPageDataRowCount;
					if (currentPageDataRowCount > 0) {
						currentPageHeight = headerCellHeight + currentRowHeight;
						currentPageDataRowCount = 1;
						pageRows[++vPages] = new Array();
						pageRows[vPages][0] = row;
					}
					else {
						WarnNoPrintableData();
						return;
					}
				}
				else{
					currentPageDataRowCount++;
				}

				// Store the row count for the last vertical page
				if (row == totalRows - 1) {
					pageRows[vPages][1] = currentPageDataRowCount;
				}
		}
	}
	   
	// Create the pages...
	var pageArray = new Array();
	var pageNumber = 0;

	// Determine the row and column spans for nested dimensions
	if (M_colDimCount > 1) {
		var colDimSpans = new Array();
		for (nestedDim = 0; nestedDim < M_colDimCount - 1; nestedDim++) {
				colDimSpans[nestedDim] = rawDataRows[nestedDim].cells[1].getAttribute("colspan");
		}
	}
	if (M_rowDimCount > 1) {
		var rowDimSpans = new Array();
		for (nestedDim = 0; nestedDim < M_rowDimCount - 1; nestedDim++) {
				rowDimSpans[nestedDim] = rawDataRows[M_colDimCount + 1].cells[nestedDim].getAttribute("rowspan");
		}
	}
	   
	var currentPage;
	var tableWidth;
	var dataTableHead;
	var dataTableBody;
	var currentDataCol;
	var lastDataCol;
	var firstColDimHeader;
	var firstSpan;
	var remainder;
	var remainingColCount;
	var remainingHeaderCount;
	var colOffset;
	var offsetColIndex;
	var offsetColIndexCount;
	var offsetHeaderRow;
	var offsetPrevHeaderRow;

	   
	// Multiple pages caused by number rows
	for (vPage = 0; vPage < pageRows.length; vPage++) {
	   
		// Multiple pages caused by number of cols
		for (hPage = 0; hPage < pageCols.length; hPage++) {
				currentPage = pageTemplate.cloneNode(true);
	         
				// Set the current max table width
				currentPage.setAttribute("width", strPageWidth, 0);
	         
				// This code is commented out because enforcing a different width on the last page caused
				// the page to extend too far vertically in certain circumstances.
				/* TBD
				if (hPage == pageCols.length - 1) {
					// Calculate total table width to enforce similar wrapping on the last horizontal page
					tableWidth = headerCellWidth;
					for (col = pageCols[hPage][0]; col <= pageCols[hPage][1]; col++) {
						tableWidth += colWidthArray[col];
					}
					strTableWidth = tableWidth + "px";
					currentPage.rows[2].cells[0].childNodes[0].setAttribute("width", strTableWidth, 0);
				}
				*/
				dataTableHead = currentPage.rows[2].cells[0].childNodes[0].appendChild(document.createElement("Thead"));
				dataTableBody = currentPage.rows[2].cells[0].childNodes[0].appendChild(document.createElement("Tbody"));
				dataTableBody.setAttribute(M_className, M_dataTableClass, 0);


				//Add in the Column Dim Header Rows
				for (row = 0; row < M_colDimCount; row++) {
					// Column Dim Header
					dataTableHead.insertRow(row);
					rawDataCells = rawDataRows[row].cells;
					colDim = rawDataCells[0].cloneNode(true);
					strColWidth = colWidthArray[0] + "px";
					colDim.setAttribute("width", strColWidth, 0);
					dataTableHead.rows[row].appendChild(colDim);
	               
					// Column Item Headers
					colCount = 1;
					if (row == M_colDimCount - 1) {
						// We don't have to worry about spans.
						while (colCount <= pageCols[hPage][1]) {
								nCol = pageCols[hPage][0] + colCount - M_rowDimCount;
								colItem = rawDataCells[nCol].cloneNode(true);
								strColWidth = colWidthArray[nCol + M_rowDimCount - 1] + "px";
								colItem.setAttribute("width", strColWidth, 0);
								dataTableHead.rows[row].appendChild(colItem);
								colCount++;
						}
					}
					else {
						// Determine the first Col Item Header and how many cols it has to span
						currentDataCol = pageCols[hPage][0] - (M_rowDimCount - 1);
						lastDataCol =  currentDataCol + pageCols[hPage][1];
						firstColDimHeader = Math.ceil(currentDataCol / colDimSpans[row]);
						remainder = (currentDataCol - 1) % colDimSpans[row];
						firstSpan = colDimSpans[row] - remainder;

						// For some reason firstSpan is being treated as a string??
						currentDataCol = currentDataCol + Number(firstSpan);
	                  
						colItem = rawDataCells[firstColDimHeader].cloneNode(true);
						colItem.setAttribute("colspan", firstSpan, 0);                 
						dataTableHead.rows[row].appendChild(colItem);

						// Determine how many more Col Item headers in this dimension can be added
						remainingColCount = pageCols[hPage][1] - firstSpan;
	                  
						if (remainingColCount > 0) {
								remainingHeaderCount = Math.ceil(remainingColCount / colDimSpans[row]);
								for (col = 1; col <= remainingHeaderCount; col++) {
									colItem = rawDataCells[firstColDimHeader + col].cloneNode(true);
	                     
									// Set the colspan
									if (col == remainingHeaderCount) {
										colItemSpan = lastDataCol - currentDataCol;
									}
									else{
										colItemSpan = colDimSpans[row];
										// colDimSpans[row] is also being treated as a string?
										currentDataCol = currentDataCol + Number(colDimSpans[row]);
									}
									colItem.setAttribute("colspan", colItemSpan, 0);
									dataTableHead.rows[row].appendChild(colItem);
								}
						}
					}
				}
				// Add in the Row Dim Headers row
				// row index was augmented to this row before exiting the previous section
				dataTableHead.insertRow(row);
				rawDataCells = rawDataRows[row].cells;
				for (col = 0; col < M_rowDimCount; col++) {
					rowDim = rawDataCells[col].cloneNode(true);
					strColWidth = colWidthArray[col] + "px";
					rowDim.setAttribute("width", strColWidth, 0);
					if (col == 0) {
						strRowHeight = rowHeightArray[row] + "px";
						rowDim.setAttribute("height", strRowHeight, 0);
					}
					dataTableHead.rows[row].appendChild(rowDim);
				}
				colCount = 0;
				while (colCount < pageCols[hPage][1]) {
					nCol = pageCols[hPage][0] + colCount;
					colItem = rawDataCells[nCol].cloneNode(true);
					strColWidth = colWidthArray[nCol] + "px";
					colItem.setAttribute("width", strColWidth, 0);
					dataTableHead.rows[row].appendChild(colItem);
					colCount++;
				}    
	         
				// Add in Data Rows
				for (row = 0; row < pageRows[vPage][1]; row++) {
					// Insert Row Items
					dataTableBody.insertRow(row);
					nRow = row + pageRows[vPage][0];

					// Insert all headers in the first row and adjust the spans
					if (row == 0) {
						offsetColIndex = 0;
						offsetColIndexCount = 0;
						offsetHeaderRow = 0;
						offsetPrevHeaderRow = 0;
						for (col = 0; col < M_rowDimCount - 1; col++) {
								// Determine where to get the label from
								remainder = (((nRow - M_colDimCount) - 1) % Number(rowDimSpans[col]));
								if (remainder != 0) {
									// Determine the row to get the cell from
									offsetHeaderRow = nRow - remainder;
									if (offsetPrevHeaderRow == offsetHeaderRow) {
										// Adjust the col index to ensure that the correct header is being retrieved
										// Note: In this implementation we assume that the nesting is consistent
										//       all the way down the table.  
										offsetColIndex = offsetColIndexCount;
										offsetColIndexCount++;
									}
									else{
										// Update header row and reset the count
										offsetPrevHeaderRow = offsetHeaderRow;
										offsetColIndexCount = 0;
									}
	                           
									// Get the header from the appropriate row, adjust the span and insert it
									rawDataCells = rawDataRows[offsetHeaderRow].cells;
									rowItem = rawDataCells[offsetColIndex].cloneNode(true);
									rowSpan = rowDimSpans[col] - remainder;
									rowItem.setAttribute("rowspan", rowSpan, 0);
									strColWidth = colWidthArray[col] + "px";
									rowItem.setAttribute("width", strColWidth, 0);
									if (col == 0) {
										// We only need to set the height once per row
										strRowHeight = rowHeightArray[nRow] + "px";
										rowItem.setAttribute("height", strRowHeight, 0);
									}
									dataTableBody.rows[row].appendChild(rowItem);

								}
						}
					}
					rawDataCells = rawDataRows[nRow].cells;
					col = 0;
					rowItem = rawDataCells[col].cloneNode(true);
					while (rowItem.tagName == "TH") {
						// Since we can't be sure that the height was set, and we don't know
						// which column we are currently looking at, we always set the height
						strRowHeight = rowHeightArray[nRow] + "px";
						rowItem.setAttribute("height", strRowHeight, 0);
						dataTableBody.rows[row].appendChild(rowItem);
						rowItem = rawDataCells[++col].cloneNode(true); 
					}

					// We need to account for the "missing" cells caused by nested rows
					colOffset = 0;
					colOffset = M_rowDimCount - col;

					// Data
					colCount = 0;
					while (colCount < pageCols[hPage][1]) {
						nCol = pageCols[hPage][0] + colCount - colOffset;
						rowData = rawDataCells[nCol].cloneNode(true);
						dataTableBody.rows[row].appendChild(rowData);
						colCount++;
					}
				}

				currentPage.style.visibility = "visible";
				for (x = 0; x < currentPage.rows.length; x++) {
					currentPage.rows[x].cells[0].childNodes[0].style.visibility = "visible";
				}
	         
				pageArray[pageNumber++] = currentPage;
		}
	}   
	// Remove the template so it doesn't take up any screen real-estate
	temp = pageTemplate.offsetParent;
	temp.removeChild(pageTemplate);
	temp = M_otherDimTable.offsetParent;
	temp.removeChild(M_otherDimTable);
	temp = M_mainTable.offsetParent;
	temp.removeChild(M_mainTable);
	   
	// Add the printable pages to the document and display them
	currentPageDiv = document.body.appendChild(document.createElement("Div"));
	var pageBreak = document.createElement("P");
	var pb;
	pageBreak.setAttribute(M_className, "pageBreakAfter", 0);
	pageBreak.innerText=" ";//IE 7 won't handle empty divs properly
	   
	// Remove the cell note tables from the main table so they don't take up any screen real-estate
	var fn = temp.removeChild(footnotesTable);
	var mv = temp.removeChild(missingValuesTable);
	var fnAdded = false;
	var mvAdded = false;
	var footnotesOnNewPage = false;
	var clFooterTable = footerTables();
	var clElement = null;
	var footerCopy = null;

	if (M_bFootnotes) {
		fn.setAttribute("width", strPageWidth, 0);
		fn.style.visibility = "visible";
	}
	if (M_bMissingValues) {
		mv.setAttribute("width", strPageWidth, 0);
		mv.style.visibility = "visible";
	}


	for (nPage = 0; nPage < pageArray.length; nPage++) {
		if (nPage < pageArray.length -1) {
				currentPageDiv.appendChild(pageArray[nPage]);
				pb = pageBreak.cloneNode(true);
				currentPageDiv.appendChild(pb);
		}
		else {
				// This is the last page...            
				previousHeight = currentPageDiv.offsetHeight;  // top of page
				currentPageDiv.appendChild(pageArray[nPage]);  // add content
	         
				if (M_bFootnotes) {
					// Try and add the footnotes
					currentPageDiv.appendChild(fn);
					totalHeight = currentPageDiv.offsetHeight;
					if (totalHeight - previousHeight < i_maxPageHeight) {
						fnAdded = true;
	            
						// Try and add the missing values, too
						if (M_bMissingValues) {
								currentPageDiv.appendChild(mv);
								totalHeight = currentPageDiv.offsetHeight;
								if (totalHeight - previousHeight < i_maxPageHeight) {
									mvAdded = true;
								}
								else{
									//remove missing values and add a page break
									mv = currentPageDiv.removeChild(mv);
									pb = pageBreak.cloneNode(true);
									currentPageDiv.appendChild(pb);
								}
						}                
					}
					else {
						//remove footnotes and add a page break
						fn = currentPageDiv.removeChild(fn);
						pb = pageBreak.cloneNode(true);
						currentPageDiv.appendChild(pb);
					}
				}
				else if (M_bMissingValues) {
					currentPageDiv.appendChild(mv);
					totalHeight = currentPageDiv.offsetHeight;
					if (totalHeight - previousHeight < i_maxPageHeight) {
						mvAdded = true;
					}
					else{
						//remove missing values and add a page break
						mv = currentPageDiv.removeChild(mv);
						pb = pageBreak.cloneNode(true);
						currentPageDiv.appendChild(pb);
					}
				}
		}
	}
  
	previousHeight = currentPageDiv.offsetHeight;
	// Check if the footnotes and missing values were added
	if ((M_bFootnotes) && (!fnAdded)) {
		// TBD - verify length of table to ensure that it does not span multiple pages...
		currentPageDiv.appendChild(fn);
		footnotesOnNewPage = true;
	}
	if ((M_bMissingValues) && (!mvAdded)) {
		currentPageDiv.appendChild(mv);
		// If we are adding to the same page as footnotes, we need to make sure we have room
		if (footnotesOnNewPage) {
				totalHeight = currentPageDiv.offsetHeight;
				if (totalHeight - previousHeight > i_maxPageHeight) {
					mvCopy = currentPageDiv.removeChild(mv);
					pb = pageBreak.cloneNode(true);
					currentPageDiv.appendChild(pb);
					currentPageDiv.appendChild(mvCopy);
				}
		}
	}
	   
	// If the footer is defined, then you have to draw the footer for each page.
	// Footer is inserted before each page break.
	if (clFooterTable != null) {
		clFooterTable.setAttribute("width", strPageWidth, 0);
		clElement = currentPageDiv.firstChild;
		while (clElement != null && pb != null) {
			if (clElement.id == pb.id ) {
				footerCopy = clFooterTable.cloneNode(true);
				currentPageDiv.insertBefore(footerCopy, clElement);
				
			}
			clElement = clElement.nextSibling;
		}
	}
	
	// Clean up the view to remove any unnecessary HTML elements
	// IE5.0 will blow up if this is done immediately,
	// so delay to allow the screen to be rendered first.
	setTimeout("CleanupViewOnPrintableVersion();", 1);

}

// Create a page template to be used on all printable pages, which contains:
// tableTitle
// otherDimTable
// dataTable with just the table tags
// sourceInfoTable
function createPageTemplate() {

	var tableTitle = document.getElementById("TitleTable");
	var sourceInfoTable = document.getElementById("SourceInfoTable");
	var rowNumber = 0;

	// Get the height of the Tables that are used on each page.  
	M_titleTableHeight = tableTitle.offsetHeight;
	M_otherDimTableHeight = M_otherDimTable.offsetHeight;
	M_sourceInfoTableHeight = sourceInfoTable.offsetHeight;

	// Create a page template
	var pageTemplate = document.body.appendChild(document.createElement("Table"));
	pageTemplate.setAttribute("id", "templateTable", 0);
	   
	// Add in a copy of the Title
	pageTemplate.insertRow(rowNumber);
	pageTemplate.rows[rowNumber].insertCell(0);
	tableTitleCopy = tableTitle.cloneNode(true);
	tableTitleCopy.setAttribute("id", "templateTitle", 0);
	pageTemplate.rows[rowNumber++].cells[0].appendChild(tableTitleCopy);
	   
	// Add in a copy of the Other Dimensions
	pageTemplate.insertRow(rowNumber);
	pageTemplate.rows[rowNumber].insertCell(0);
	otherDimTableCopy = M_otherDimTable.cloneNode(true);
	otherDimTableCopy.setAttribute("id", "templateOther", 0);
	pageTemplate.rows[rowNumber++].cells[0].appendChild(otherDimTableCopy);
	   
	// Add in a copy of the frame of the Data Table
	pageTemplate.insertRow(rowNumber);
	pageTemplate.rows[rowNumber].insertCell(0);
	dataTableCopy = M_dataTable.cloneNode(false); // we only want the table itself
	dataTableCopy.setAttribute("id", "templateDataTable", 0);
	dataTableCopy.setAttribute("border", "1", 0);
	dataTableCopy.style.height = "";
	dataTableCopy.style.width = "";
	pageTemplate.rows[rowNumber++].cells[0].appendChild(dataTableCopy);
	   
	// Add in a copy of the Source Info
	pageTemplate.insertRow(rowNumber);
	pageTemplate.rows[rowNumber].insertCell(0);
	sourceInfoTableCopy = sourceInfoTable.cloneNode(true);
	dataTableCopy.setAttribute("id", "templateSourceInfoTable", 0);
	pageTemplate.rows[rowNumber].cells[0].appendChild(sourceInfoTableCopy);
	   
	return pageTemplate;
}

// This function sets the page size based on the paper size, orientation, and margins
// specified in Printable Version Options
function setPrintablePageSize() {

	var paperType = 4;
	var paperOrientation;
	var marginsArray;
	var leftMargin = 1;
	var rightMargin = 1;
	var topMargin = 1;
	var bottomMargin = 1;
	var availWidth = 0;
	var availHeight = 0;
	   
	// Get the paper type
	paperType = ObjWdsForm.sWD_PrintPaperSize.value;
	   
	// Get the margins
	marginsArray = ObjWdsForm.sWD_PrintMargins.value.split(",");
	leftMargin = marginsArray[0];
	rightMargin = marginsArray[1];
	topMargin = marginsArray[2];
	bottomMargin = marginsArray[3];
	   
	// Get the paper orientation
	paperOrientation = ObjWdsForm.sWD_PrintOrientation.value;
	
	// Portrait
	if (paperOrientation == "0") { 
		availWidth = M_paperSizes[paperType][0] - leftMargin - rightMargin;
		availHeight = M_paperSizes[paperType][1] - topMargin - bottomMargin;
	}
	// Landscape - reverse the height and width
	else{
		availWidth = M_paperSizes[paperType][1] - leftMargin - rightMargin;
		availHeight = M_paperSizes[paperType][0] - topMargin - bottomMargin;
	}

	M_printableWidth = availWidth * M_conversionFactor * M_pixelsPerInch; 
	M_printableHeight = availHeight * M_conversionFactor * M_pixelsPerInch;

}

// This function removes all unnecessary HTML tables from the Printable Version so that 
// cutting and pasting into Word is significantly faster.  This includes the original 
// table that was used to construct the printable version, the form fields, and the 
// cover table that displays the Please Wait screen.
function CleanupViewOnPrintableVersion() {

		var pageTable = document.getElementById("pageTable");
		var cover = document.getElementById("cover");

		// Remove the original table and form fields
		var temp = pageTable.offsetParent;
		temp.removeChild(pageTable);

		// Remove the cover table
		temp = cover.offsetParent;
		temp.removeChild(cover);
}
