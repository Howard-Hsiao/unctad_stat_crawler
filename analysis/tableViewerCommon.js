var GnCurDim = null;
var GnCurDimBeforeSummary = null;
var GstrAction = null;
var GnMemberPosition = null;
var GstrSummary = null;
var GstrPageBeforeSummary = null;
var G_nOldSize = -1;

// this function is used to monitor if the browser's font size is changed.  If so,
// it forces a resize of the 'data table' which ensures the scroll bars are properly shown.
function GHandleFontSizeChange() {
	var nNewSize;

	if (PWdsapp_bIsIE) {
		nNewSize = parseInt(document.body.currentStyle.fontSize);
	}
	else {
		nNewSize = parseInt(document.defaultView.getComputedStyle(document.body, '').getPropertyValue("font-size"));
	}
	if (G_nOldSize != -1) {
		if (G_nOldSize != nNewSize) {
			if (document.location.pathname.indexOf("dimView.aspx")<0) //invoke this in TableViewer only
				Resize();
		}
	}
	G_nOldSize = nNewSize;
}

var G_arrOtherBarTexts = null;

//truncates texts on the other bar and resizes their cells, if necessary
function ResizeOtherBar() {
	//settings
	var nMaxDims = 10; //IVT format limit
	var nAllowedWordLength = 6; //items of this length or less won't be truncated

	//remember the original texts from the other bar, if this is the first visit
	if (G_arrOtherBarTexts == null) {
		G_arrOtherBarTexts = new Array();
		var nCrt = 0;

		for (i = 0; i < nMaxDims; i++) {
			var clDimNameCell = document.getElementById("OthDimName" + i.toString());
			var clDimItemCell = document.getElementById("OthDimItem" + i.toString());
			if (clDimNameCell != null && clDimItemCell != null) {
				G_arrOtherBarTexts[nCrt++] = clDimNameCell.innerHTML;
				G_arrOtherBarTexts[nCrt++] = clDimItemCell.innerHTML;
			}
		}
	}

	//what is the current browser width?
	var nWindowWidth = 0;
	if (PWdsapp_bIsIE) {
		nWindowWidth = document.body.clientWidth;
	}
	else {
		nWindowWidth = window.innerWidth;
	}

	//restore the texts from the array (in case we have already truncated and then the page became wider and we can now allow more 
	//letters or even stop truncating completely)
	if (G_arrOtherBarTexts != null) {
		var nCrt = 0;

		for (i = 0; i < nMaxDims; i++) {
			var clDimNameCell = document.getElementById("OthDimName" + i.toString());
			var clDimItemCell = document.getElementById("OthDimItem" + i.toString());
			if (clDimNameCell != null && clDimItemCell != null) {
				clDimNameCell.innerHTML = G_arrOtherBarTexts[nCrt++];
				clDimItemCell.innerHTML = G_arrOtherBarTexts[nCrt++];
			}
		}
	}

	//find the last cell in the Other bar
	var nMaxLeftOffset = 0;
	var nLastCellEndsHere = 0;
	for (i = 0; i < nMaxDims; i++) {
		var clCell = document.getElementById("Oth" + i.toString());
		var clDimNameCell = document.getElementById("OthDimName" + i.toString());
		var clDimItemCell = document.getElementById("OthDimItem" + i.toString());
		if (clCell != null && clDimNameCell != null && clDimItemCell != null) {
			var nAbsPosOfCell = clDimNameCell.offsetLeft + clCell.offsetLeft;
			if (nMaxLeftOffset < nAbsPosOfCell) {
				nMaxLeftOffset = nAbsPosOfCell;
				nLastCellEndsHere = nAbsPosOfCell + clDimNameCell.offsetWidth + clDimItemCell.offsetWidth + 40; //include some overhead for summary icons and spaces
			}
		}
	}
	//window.status = nMaxLeftOffset.toString() + "  " + nLastCellEndsHere.toString();
	if (nLastCellEndsHere < nWindowWidth) //it all fits
		return;

	//truncate
	var nRatio = nWindowWidth / nLastCellEndsHere - 0.35;
	for (i = 0; i < nMaxDims; i++) {
		var clDimNameCell = document.getElementById("OthDimName" + i.toString());
		var clDimItemCell = document.getElementById("OthDimItem" + i.toString());
		if (clDimNameCell != null && clDimItemCell != null) {
			var str1 = clDimNameCell.innerHTML;
			if (str1.length > nAllowedWordLength)
				clDimNameCell.innerHTML = str1.substring(0, (str1.length * nRatio).toFixed(0)) + '&hellip;';

			str1 = clDimItemCell.innerHTML;
			if (str1.length > nAllowedWordLength)
				clDimItemCell.innerHTML = str1.substring(0, (str1.length * nRatio).toFixed(0)) + '&hellip;';
		}
	}
}

function zeroScrollPosition() {
	if (ObjWdsForm.sWD_PosX != null) {
		ObjWdsForm.sWD_PosX.value = 0;
		ObjWdsForm.sWD_PosY.value = 0;
	}
	if (ObjWdsForm.sWD_VPos != null) {
		ObjWdsForm.sWD_VPos.value = 0;
	}
}

function savePosition() {
	// Cancel this stuff for pop-up windows
	if (ObjWdsForm.sWD_PosX == null) return;
	if (!PWdsapp_bIsIE) {
		ObjWdsForm.sWD_PosX.value = window.pageXOffset;
		ObjWdsForm.sWD_PosY.value = window.pageYOffset;
	}
	else {
		ObjWdsForm.sWD_PosX.value = document.all['SpanTable'].scrollLeft;
		ObjWdsForm.sWD_PosY.value = document.all['SpanTable'].scrollTop;
	}
}

function getPositionX() {
	if (ObjWdsForm.sWD_PosX == null)
		return 0;
	return adjustPosition(ObjWdsForm.sWD_PosX.value);
}

function getPositionY() {
	if (ObjWdsForm.sWD_PosY == null)
		return 0;
	return adjustPosition(ObjWdsForm.sWD_PosY.value);
}

function GetViewDim(i_nStoredDim) {
	return i_nStoredDim;
}

// Verifies that the given string is not empty
function IsControlEmpty(i_clObject, strMsg) {
	var str = i_clObject.value;
	if (str == null || str == "") {
		alert(strMsg);
		myfocus(i_clObject);
		return true;
	}

	return false;
}

// Checks the length of the given string
function CheckForLength(i_clObject, maxLen, i_strMessage) {
	if (i_clObject.value.length > maxLen) {
		alert(i_strMessage);
		i_clObject.select();
		myfocus(i_clObject);
		return false;
	}
	return true;
}

// Returns true if the string contains only AlphaNumeric characters.
// i_bIgnoreSpaces specifies whether a space is permitted.
function IsAlphaNum(i_strString, i_bIgnoreSpaces, i_bLogin) {
	var nIndex;
	var nCode;
	var nTemp;
	for (nIndex = 0; nIndex < i_strString.length; nIndex++) {
		nTemp = i_strString.charAt(nIndex);
		nCode = i_strString.charCodeAt(nIndex);
		if (i_bIgnoreSpaces == false) {
			if (nCode == 32)
				return false;
		}  
		if (i_bLogin) {
			if (((nCode >= 0) && (nCode <= 31)) ||    // invalid chars
				((nCode >= 33) && (nCode <= 47)) ||    // invalid chars
				((nCode >= 58) && (nCode <= 64)) ||    // :;<=>?@
				((nCode >= 91) && (nCode <= 96)) ||    // [\]^_`
				((nCode >= 123) && (nCode <= 127)))
			{
				return false;
			}
		}
	}
	return true;
}

//i_nDefaultDim is only needed in thematic maps, to open the geographic dimension instead of 0 at the first visit to the item selection page
function ShowView(i_nType, i_nDefaultDim) {
	if (i_nType == 6) //moving to item selection is a special case
		return ShowLastVisitedDim(i_nDefaultDim);

	CreateHiddenFormField(ObjWdsForm, "CS_InHelp", "False");
	CreateHiddenFormField(ObjWdsForm, "WD_Command", "SetViewType");
	CreateHiddenFormField(ObjWdsForm, "WD_ViewType", i_nType);
	ObjWdsForm.action = gastrUrl[i_nType];
	executeWait(ObjWdsForm);
}

//Simulates a click on the hyperlink for the currently selected dimension. For example if you click the Item Selection tab while in table/chart/map, this will
//take you to the item selection page for the same dimension you visited last time. If this is the first visit to item selection, we open the first dimension.
function ShowLastVisitedDim(i_nDefaultDim) {
	if (typeof(ObjWdsForm) != "undefined") {
		zeroScrollPosition();
		var clActiveDim = ObjWdsForm.sWD_ActiveDim;
		if(i_nDefaultDim == null) i_nDefaultDim = 0;
		var strCrtDim = (clActiveDim == null)?i_nDefaultDim.toString():clActiveDim.value;
		if (strCrtDim == "-1") strCrtDim = i_nDefaultDim.toString();

		CreateHiddenFormField(ObjWdsForm, "WD_Dim", strCrtDim);
		CreateHiddenFormField(ObjWdsForm, "WD_Command", "SetActiveDim");
		CreateHiddenFormField(ObjWdsForm, "CS_InHelp", "False");
		ObjWdsForm.action = "../TableViewer/dimView.aspx";
		executeWait(ObjWdsForm);
	}
}

function ShowMap() {
	var nWidth = 0;
	var nHeight = 0;

	if (typeof(window.innerWidth) == 'number') {
		// Non-IE
		nWidth = window.innerWidth;
		nHeight = window.innerHeight;
	}
	else {
		if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
			// IE 6+ in 'standards compliant mode'
			nWidth = document.documentElement.clientWidth;
			nHeight = document.documentElement.clientHeight;
		} 
		else {
			if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
				// IE 4 compatible
				nWidth = document.body.clientWidth;
				nHeight = document.body.clientHeight;
			}
		}
	}

	CreateHiddenFormField(ObjWdsForm, "WD_ClientSize", nHeight + "," + nWidth);
	ObjWdsForm.action = "../ThematicMaps/mapView.aspx";
	executeWait(ObjWdsForm);
}

function ShowDim(i_unDimId) {
	if (typeof(ObjWdsForm) != "undefined") {
		zeroScrollPosition();
		CreateHiddenFormField(ObjWdsForm, "WD_Command", "SetActiveDim");
		CreateHiddenFormField(ObjWdsForm, "WD_Dim", i_unDimId);
		ObjWdsForm.action = "../TableViewer/dimView.aspx";
		executeWait(ObjWdsForm);
	}
}

function OnTableSummary() {
	var bIsSpawnWindow = IsSpawnWindow();
	if (bIsSpawnWindow) {
		GetFormFields();
	}
	CreateHiddenFormField(ObjWdsForm, "WD_Command", "ShowTableSummary");
	CreateHiddenFormField(ObjWdsForm, "WD_PageBeforeSummary", document.location.pathname);
	ObjWdsForm.action = "../TableViewer/summary.aspx";
	WaitForProperPage();
	if (bIsSpawnWindow) {
		SetFormFields();
	}
}

function OnDimensionSummary(i_nDim) {
	var bIsSpawnWindow = IsSpawnWindow();
	if (bIsSpawnWindow) {
		GetFormFields();
	}
	CreateHiddenFormField(ObjWdsForm, "WD_Command", "ShowDimensionSummary");
	CreateHiddenFormField(ObjWdsForm, "WD_Dim", i_nDim);
	CreateHiddenFormField(ObjWdsForm, "WD_PageBeforeSummary", document.location.pathname);
	ObjWdsForm.action = "summary.aspx";
	WaitForProperPage();
	if (bIsSpawnWindow) {
		SetFormFields();
	}
}

function OnDimViewItemSummary(i_nDim, i_nItemHandle) {
	bIsSpawnWindow;

	var bIsSpawnWindow = IsSpawnWindow();
	if (bIsSpawnWindow) {
		GetFormFields();
	}
	CreateHiddenFormField(ObjWdsForm, "WD_Command", "ShowItemSummary");
	CreateHiddenFormField(ObjWdsForm, "WD_Dim", i_nDim);
	CreateHiddenFormField(ObjWdsForm, "WD_ItemHandle", i_nItemHandle);
	CreateHiddenFormField(ObjWdsForm, "WD_CurDimBeforeSummary", ObjWdsForm.sWD_ActiveDim.value);
	CreateHiddenFormField(ObjWdsForm, "WD_PageBeforeSummary", document.location.pathname);
	ObjWdsForm.action = "summary.aspx";
	WaitForProperPage();
	if (bIsSpawnWindow) {
		SetFormFields();
	}
}

function OnTableViewItemSummary(i_nDim, i_nMemberPosition) {
	var bIsSpawnWindow = IsSpawnWindow();
	if (bIsSpawnWindow) {
		GetFormFields();
	}
	CreateHiddenFormField(ObjWdsForm, "WD_Command", "ShowTableViewItemSummary");
	CreateHiddenFormField(ObjWdsForm, "WD_Dim", i_nDim);
	CreateHiddenFormField(ObjWdsForm, "WD_MemberPosition", i_nMemberPosition);
	CreateHiddenFormField(ObjWdsForm, "WD_PageBeforeSummary", document.location.pathname);
	ObjWdsForm.action = "summary.aspx";
	WaitForProperPage();
	if (bIsSpawnWindow) {
		SetFormFields();
	}
}

function OnLoadView(i_strViewName, i_bShared, i_eType) {
	var strActionPage;

	if (i_eType == 2) {
		strActionPage = "ChartView";
	}
	else {
		strActionPage = "TableView";
	}
	if ((i_strViewName != null) && (i_strViewName.length > 0)) {
		ObjWdsForm.action = "../TableViewer/" + strActionPage + ".aspx";
		ObjWdsForm.ViewName.value = i_strViewName;
		ObjWdsForm.bShared.value = i_bShared;
		executeWait(ObjWdsForm);
	}
}

function OnHelpWindow(i_bOnTab) {
	var strAnchor = "wdshelp.htm";
	var strMainFrame;
	var wndHelp;
	var nDim, nMaxDim;

	strMainFrame = location.toString().toLowerCase()
	if (strMainFrame.indexOf("dimview.aspx") >= 0) {
		// Any changes made to any item should be save to the hidden fields
		strAnchor = "selectitems.htm";
	}
	else if (strMainFrame.indexOf("tableview.aspx") >= 0) {
		strAnchor = "wdshelp.htm";
	}
	else if (strMainFrame.indexOf("chartview.aspx") >= 0) {
		strAnchor = "wdshelpcharts.htm";
	}

	OpenHelpWindow(strAnchor, i_bOnTab);
}

function M_Wdsapp_DisplayTableTitle(io_clWindow) {
	if (strTableTitle) {
		io_clWindow.document.write("<DIV id=MESSAGE-HEAD>" + 
		strTableTitle + "</DIV>"); 
	}
}

//If the parameter i_nType is passed, and we're assuming ownership as a publisher, the report will be saved with that type. 
//Used for the map icon in Publisher/AddingResults.aspx
function OnSaveReport(i_nType) {
	var strAssumeOwner = ReadHiddenFormField(ObjWdsForm, "sWD_AssumeOwner", "");
	if (strAssumeOwner.length > 0) {
		if (typeof (i_nType) != "undefined") {
			CreateHiddenFormField(ObjWdsForm, "WD_ChangeReportType", i_nType.toString());
		}
		CreateHiddenFormField(ObjWdsForm, "WD_Command", "SaveReportInPlace");
		executeWait(ObjWdsForm);
		return;
	}
	else {
		ObjWdsForm.CS_SaveMode.value = "True";
		var strUrl = G_strRootPath + "/ReportFolders/reportFolders.aspx?IF_Mode=1&IF_ReportName=" + URIencode(ObjWdsForm.CS_ReportTitle.value);
		if (IsLoggedIn()) {
			ObjWdsForm.action = strUrl;
		}
		else {
			CreateHiddenFormField(ObjWdsForm, "CS_TargetPage", document.getElementById("CS_NextPage").value);
			CreateHiddenFormField(ObjWdsForm, "LG_targetpage", strUrl);
			ObjWdsForm.action = G_strRootPath + "/Common/Login/Login.aspx";
		}
	}
	executeWait(ObjWdsForm);
}

function OnCancelSaveReport() {
	window.open('', '_self'); //hack to convince IE 8 to close without prompting (Mantis 986)
	window.close();
}

function OnDimOrder(i_clObject) {
	i_clObject.action = "DimOrder.aspx";
	i_clObject.CS_InHelp.value = "False";
	i_clObject.CS_TargetPage.value = document.location.pathname;
	executeWait(i_clObject);
}

function OnPageSetup(i_clObject) {
	i_clObject.action = "PrintOptions.aspx";
	i_clObject.IF_ReportType.value = REPORT_TYPE_TABLE;
	i_clObject.CS_InHelp.value = "False";
	executeWait(i_clObject);
}

function WaitForProperPage() {
	if (IsSpawnWindow()) {
		SpawnWindow();
	}
	else {
		executeWait(ObjWdsForm);
	}
}

function GetFormFields() {
	if (typeof(ObjWdsForm.sWD_ActiveDim) != "undefined") {
		GnCurDim = ObjWdsForm.sWD_ActiveDim.value;
	}
	if (typeof(ObjWdsForm.WD_CurDimBeforeSummary) != "undefined") {
		GnCurDimBeforeSummary = ObjWdsForm.WD_CurDimBeforeSummary.value;
	}	
	if (typeof(ObjWdsForm.action) != "undefined") {
		GstrAction = ObjWdsForm.action;
	}
	if (typeof(ObjWdsForm.sWD_ActiveMember) != "undefined") {
		GnMemberPosition = ObjWdsForm.sWD_ActiveMember.value;
	}		
	if (typeof(ObjWdsForm.WD_Summary) != "undefined") {
		GstrSummary = ObjWdsForm.WD_Summary.value;
	}
	if (typeof(ObjWdsForm.WD_PageBeforeSummary) != "undefined") {
		GstrPageBeforeSummary = ObjWdsForm.WD_PageBeforeSummary.value;
	}
}

function SetFormFields() {
	if (typeof(ObjWdsForm.sWD_ActiveDim) != "undefined") {
		ObjWdsForm.sWD_ActiveDim.value = GnCurDim;
	}
	if (typeof(ObjWdsForm.WD_CurDimBeforeSummary) != "undefined") {
		ObjWdsForm.WD_CurDimBeforeSummary.value = GnCurDimBeforeSummary;
	}	
	if (typeof(ObjWdsForm.action) != "undefined") {
		ObjWdsForm.action = GstrAction;
	}
	if (typeof(ObjWdsForm.sWD_ItemID) != "undefined") {
		ObjWdsForm.sWD_ActiveMember.value = GnMemberPosition;
	}		
	if (typeof(ObjWdsForm.WD_Summary) != "undefined") {
		ObjWdsForm.WD_Summary.value = GstrSummary;
	}
	if (typeof(ObjWdsForm.WD_PageBeforeSummary) != "undefined") {
		ObjWdsForm.WD_PageBeforeSummary.value = GstrPageBeforeSummary;
	}
}

function ShowRetrievingDataMessage(i_objTargetElement) {
	var objDiv = document.getElementById("RetrieveData");
	if (objDiv) {
		objDiv.style.visibility = "visible";
	}
	else {
		var objDataTable = document.getElementById(i_objTargetElement);
		var nOffsetTop = objDataTable.offsetTop;
		var nOffsetLeft = objDataTable.offsetLeft;
		var objParent = objDataTable.offsetParent;
		objDiv = document.createElement("DIV");

		while (objParent != null && objParent.tagName.toUpperCase() != "BODY") {
			nOffsetLeft += objParent.offsetLeft;
			nOffsetTop += objParent.offsetTop;
			objParent = objParent.offsetParent;
		}

		objDiv.id = "RetrieveData";
		objDiv.align = "left";
		objDiv.style.position="absolute";
		objDiv.innerHTML = "<FONT class='TVGeneralText'>" + resRetrievingData + "...</FONT>";
		if (PWdsapp_bIsIE) {
			objDiv.style.posTop = nOffsetTop;
			objDiv.style.posLeft = nOffsetLeft + 3;
		}
		else {
			objDiv.style.top = nOffsetTop;
			objDiv.style.left = nOffsetLeft+ 3;
		}
		objDiv.style.visibility = "visible";
		document.body.appendChild(objDiv);
	}
}

function RemoveRetrievingDataMessage() {
	if (document.getElementById("RetrieveData")) {
		document.getElementById("RetrieveData").style.visibility = "hidden";
	}
}
