// Version 8.2.00700
//==============================================================================
// JAVASCRIPT COMMON FUNCTIONS ARE DIVIDED INTO THREE MAIN SECTIONS:
// 1. COMMON FUNCTIONS FOR ALL OUR PAGES
// 2. COMMON FUNCTIONS THAT ARE USED FOR THE LAYOUT OF THE PAGE
// 3. COMMON EVENT HANDLER FUNCTIONS

var GJSSYS_BROWSER_UNKNOWN = 0;
var GJSSYS_BROWSER_N451    = 1;
var GJSSYS_BROWSER_MS55    = 2;
var GJSSYS_BROWSER_MS50    = 3;
var GJSSYS_BROWSER_MS401   = 4;
var GJSSYS_BROWSER_N6      = 5;
var GJSSYS_BROWSER_MS6     = 6;
var GJSSYS_BROWSER_N70     = 7;
var GJSSYS_BROWSER_N71     = 8;
var GJSSYS_BROWSER_SAFARI  = 9;
var GJSSYS_BROWSER_FIREFOX = 10;
var GJSSYS_BROWSER_CHROME = 11;

var PWdsapp_eBrowser;
var PWdsapp_bIsIE;
var PWdsapp_bActiveXEnabled;
var PWdsapp_bBrowserClassname;

var REPORT_TYPE_FOLDER = 0;
var REPORT_TYPE_TABLE = 1;
var REPORT_TYPE_CHART = 3;
var REPORT_TYPE_EXCEL = 4;
var REPORT_TYPE_PDF = 5;
var REPORT_TYPE_ITEMSEL = 6;
var REPORT_TYPE_DOC = 7;
var REPORT_TYPE_HTM = 8;
var REPORT_TYPE_HTML = 9;
var REPORT_TYPE_PPT = 10;
var REPORT_TYPE_TXT = 11;
var REPORT_TYPE_MAP = 13;
var REPORT_TYPE_B2R = 14;
var REPORT_TYPE_ZIP = 15;
var REPORT_TYPE_CSV = 16;

var bFullScreen;
var G_strRootPath = "";

var undefined;

//Wds Form
var ObjWdsForm;

// used for encoding in older browsers.
var G_bURIEncode = typeof encodeURIComponent == "function";
var hexchars = "0123456789ABCDEF";
var okURIchars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

//==============================================================================
// COMMON FUNCTIONS THAT CAN BE CALLED FROM ALL OF OUR PAGES
//==============================================================================
// Functions that are called once, during initialization.
//------------------------------------------------------------------------------
// Get the Browser type and version
function GetBrowser()
{
	var dAppVersion;
	var strAppName;

	PWdsapp_bIsIE = false;
	PWdsapp_bBrowserClassname = false;
	strAppName = navigator.appName;
	if (strAppName == "Netscape") {
		var strUserAgent = window.navigator.userAgent.toLowerCase();
		if (strUserAgent.indexOf("firefox") > 0) {
			PWdsapp_eBrowser = GJSSYS_BROWSER_FIREFOX;
		}
		else if (strUserAgent.indexOf("webkit") > 0) {  //Chrome or Safari
			//Chrome 2.0 returns a string that includes applewebkit chrome safari mozilla. Yes, it actually includes "safari". 
			//So does Safari, except it doesn't include "chrome".
			if (strUserAgent.indexOf("chrome") > 0) {
				PWdsapp_eBrowser = GJSSYS_BROWSER_CHROME;
			}
			else if (strUserAgent.indexOf("safari") > 0) {
				PWdsapp_eBrowser = GJSSYS_BROWSER_SAFARI;
			}
		}
		else if (strUserAgent.indexOf("netscape") > 0) {
			dAppVersion = parseFloat(navigator.appVersion);
			if (dAppVersion >= 5.0) {
				PWdsapp_eBrowser = GJSSYS_BROWSER_N6;
				dAppVersion = parseFloat(navigator.userAgent.split("Netscape/")[1]);
				if (dAppVersion == 7.0)
					PWdsapp_eBrowser = GJSSYS_BROWSER_N70;
				else if (dAppVersion >= 7.1)
					PWdsapp_eBrowser = GJSSYS_BROWSER_N71;
			}
			else if (dAppVersion >= 4.51) {
				PWdsapp_eBrowser = GJSSYS_BROWSER_N451;
			}
		}
		else {
			PWdsapp_eBrowser = GJSSYS_BROWSER_FIREFOX;
		}
	}
	else if (strAppName == "Microsoft Internet Explorer") {
		dAppVersion = parseFloat(navigator.appVersion.split("MSIE")[1]);
		if (dAppVersion >= 10.0) {
			PWdsapp_eBrowser = GJSSYS_BROWSER_MS6;
		}
		else {
			PWdsapp_bIsIE = true;
			PWdsapp_bBrowserClassname = true;
			if (dAppVersion >= 6.0) {
				PWdsapp_eBrowser = GJSSYS_BROWSER_MS6;
			}
			else if (dAppVersion >= 5.5) {
					PWdsapp_eBrowser = GJSSYS_BROWSER_MS55;
			}
			else if (dAppVersion >= 5.0) {
				PWdsapp_eBrowser = GJSSYS_BROWSER_MS50;
			}
			else if (dAppVersion >= 4.01) {
				PWdsapp_eBrowser = GJSSYS_BROWSER_MS401;
			}
		}
	}
	else {
		PWdsapp_eBrowser = GJSSYS_BROWSER_UNKNOWN;
	}
}
GetBrowser();


// Check if ActiveX support is enabled.
function CheckActiveX()
{
	PWdsapp_bActiveXEnabled = false;
	// If IE, test if ActiveX support is enabled.
	if(PWdsapp_bIsIE) {
		try {
			xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
			PWdsapp_bActiveXEnabled = true;
		}
		catch(ex) {
		}
	}
}

CheckActiveX();

function utf8(wide) {
	var c, s;
	var enc = "";
	var i = 0;
	while(i<wide.length) {
		c= wide.charCodeAt(i++);
		// handle UTF-16 surrogates
		if (c>=0xDC00 && c<0xE000) continue;
		if (c>=0xD800 && c<0xDC00) {
			if (i>=wide.length) continue;
			s= wide.charCodeAt(i++);
			if (s<0xDC00 || c>=0xDE00) continue;
			c= ((c-0xD800)<<10)+(s-0xDC00)+0x10000;
		}
		// output value
		if (c<0x80) enc += String.fromCharCode(c);
		else if (c<0x800) enc += String.fromCharCode(0xC0+(c>>6),0x80+(c&0x3F));
		else if (c<0x10000) enc += String.fromCharCode(0xE0+(c>>12),0x80+(c>>6&0x3F),0x80+(c&0x3F));
		else enc += String.fromCharCode(0xF0+(c>>18),0x80+(c>>12&0x3F),0x80+(c>>6&0x3F),0x80+(c&0x3F));
	}
	return enc;
}

function toHex(n) {
	return hexchars.charAt(n>>4)+hexchars.charAt(n & 0xF);
}

function encodeURIComponentOld(s) {
	var s = utf8(s);
	var c;
	var enc = "";
	for (var i= 0; i<s.length; i++) {
		if (okURIchars.indexOf(s.charAt(i))==-1)
			enc += "%"+toHex(s.charCodeAt(i));
		else
			enc += s.charAt(i);
	}
	return enc;
}

function URIencode(i_strString) {
	if (G_bURIEncode) {
		return encodeURIComponent(i_strString);
	}
	else {
		return encodeURIComponentOld(i_strString);
	}
}

function HTMLencode(
	i_strString
	)
{
	var encodedResult;

	encodedResult = i_strString;
	if (i_strString.indexOf("&") > -1 || i_strString.indexOf("<") > -1 
			|| i_strString.indexOf(">") > -1 || i_strString.indexOf("'") > -1 
			|| i_strString.indexOf('"') > -1 || i_strString.indexOf("�") > -1)
	{
		// the & must be done first.
		encodedResult = encodedResult.replace(/&/gi,"&amp;");
		encodedResult = encodedResult.replace(/</gi,"&lt;");
		encodedResult = encodedResult.replace(/>/gi,"&gt;");
		encodedResult = encodedResult.replace(/'/gi,"&apos;");
		encodedResult = encodedResult.replace(/"/gi,"&quot;");
		encodedResult = encodedResult.replace(/\�/gi,"&#183;");  
	}

	return encodedResult;
}

function TrimWhiteSpace(i_strName)
{
	return i_strName.replace(/^\s+|\s+$/g, '');
}

// Get the index where this specified rule exists in the style sheet.
function getStyleSheetRuleIndex(
	i_strRuleName
	)
{
	var astrRules;
	var strRuleName = i_strRuleName.toString().toLowerCase();

	if (i_strRuleName.charAt(0) != ".") {
		strRuleName = "." + strRuleName;
	}

	// If the browser supports the W3C DOM way, use cssRules.
	if (document.styleSheets[0].cssRules) {
		astrRules = document.styleSheets[0].cssRules;
	}
	// If it supports the Microsoft way, use rules.
	else if (document.styleSheets[0].rules) {
		astrRules = document.styleSheets[0].rules;
	}
	for (var i = 0; i < astrRules.length; i++) {
      //YCE: Test string is not undefined
      if ((astrRules[i].selectorText !== undefined) && (astrRules[i].selectorText.toLowerCase() == strRuleName)) {
			return i;
		}
	}

	return 0;
}

// Get the value of the specified style from the rule at with the specified name.
function GetRuleStyle(
	i_strRuleName,
	i_strStylePropName
	)
{
	var strStylePropValue;
	var nRuleIndex;

	strStylePropValue	= "";
	nRuleIndex = getStyleSheetRuleIndex(i_strRuleName);
	strStylePropValue = GetRuleStyleByIndex(nRuleIndex, i_strStylePropName);

	return strStylePropValue;
}

// Get the value of the specified style from the rule at the specified index.
function GetRuleStyleByIndex(
	i_nRuleIndex,
	i_strStylePropName
	)
{
	var strStylePropValue = "";
	var clRule = null;

	if (i_nRuleIndex >= 0) {
		clRule = GetRuleByIndex(i_nRuleIndex);
		if (clRule != null) {
			eval("strStylePropValue = clRule.style." + i_strStylePropName);
		}
	}

	return strStylePropValue;
}

// Get the rule at the specified index.
function GetRuleByIndex(
	i_nRuleIndex
	)
{
	var clRule = null;

	if (i_nRuleIndex >= 0) {
		// If the browser supports the W3C DOM way, use cssRules.
		if (document.styleSheets[0].cssRules) {
			clRule = document.styleSheets[0].cssRules[i_nRuleIndex];
		}
		// If it supports the Microsoft way, use rules.
		else if (document.styleSheets[0].rules) {
			clRule = document.styleSheets[0].rules[i_nRuleIndex];
		}
	}

	return clRule;
}

// Get the rule with the specified name.
function GetRuleByName(i_strRuleName) {
	var nRuleIndex = getStyleSheetRuleIndex(i_strRuleName);
	return GetRuleByIndex(nRuleIndex);
}

//==============================================================================
// COMMON FUNCTIONS THAT ARE USED FOR THE LAYOUT OF THE PAGE

function myfocus(obj) {
	var coverTop = document.getElementById("CoverTop");
	if (obj.style.visibility != 'hidden' && coverTop == null) {
		try {
			obj.focus();
		} 
		catch(e) {
		
		}
		if (obj.select != 'undefined') {
			try {
				obj.select();
			}
			catch(e) {}
		}
	}
	else {
		obj.blur();
	}
}

// This function works only for Netscape
function testScroll()
{
	// Initialize scrollbar cache if necessary
	if (window._pageXOffset == null) {
		window._pageXOffset = window.pageXOffset;
		window._pageYOffset = window.pageYOffset;
	}
	// Expose Internet Explorer compatible object model
	document.body.scrollTop = window.pageYOffset;
	document.body.scrollLeft = window.pageXOffset;
	window.document.body.scrollHeight = document.height;
	window.document.body.scrollWidth = document.width;

	// If cache != current values, call the onscroll event
	if (((window.pageXOffset != window._pageXOffset) || 
		(window.pageYOffset != window._pageYOffset)) && (window.onscroll))
		window.onscroll();
	// Cache new values
	window._pageXOffset = window.pageXOffset;
	window._pageYOffset = window.pageYOffset;
}

function IsOkSetActive()
{
	if( typeof(document.activeElement.type) == 'undefined') {
		return true;
	}
	return false;
}

function onObjectClick()
{
	if (PWdsapp_bIsIE) {
		if (IsOkSetActive()) {
			if (PWdsapp_eBrowser == GJSSYS_BROWSER_MS55) {
				if (typeof(document.all['SpanTable']) != 'undefined') {
					setTimeout("document.all['SpanTable'].setActive();", 1);
				}
			}
		}
	}
	
	HideAllMenus();
}

function adjustPosition(nPos)
{
	if (typeof(nPos) == "undefined")
		nPos = 0;
	return nPos;
}

function scrollToPosition()
{
	if (!PWdsapp_bIsIE) {
		window.scrollTo(getPositionX(), getPositionY());
	}
	else {
		document.all['SpanTable'].scrollTop = getPositionY();
		document.all['SpanTable'].scrollLeft = getPositionX();
	}
}

function setWDSScroll()
{
	if (typeof(savePosition) != 'undefined') {

		if (!PWdsapp_bIsIE) {
			window.onscroll = savePosition;
			setTimeout("scrollToPosition();", 1);
		}
		else {
			// the logic should be better here.  There is not always
			// a SpanTable span, and if there is, it needs to be resized
			// and positioned differently depending on if the folder pane is
			// shown or hidden (maybe the search page too)
			if (typeof(document.all['SpanTable']) != 'undefined') {
				document.all['SpanTable'].onscroll = savePosition;

				var nTimeout;
				nTimeout = 100;
				if (typeof(ObjWdsForm.IF_ReportType) != 'undefined')
					{
					if (ObjWdsForm.IF_ReportType.value == REPORT_TYPE_CHART)
						nTimeout = 500;

					setTimeout("scrollToPosition();", nTimeout);
					}
			}
		}
	}
}

//  This routine will initialize the form object, if the page has a form then an id
//  for that form will be retrieved. The entire WdsAsp solution will have the same form
//  name (WdsForm).
function initWdsFormObj() {
	ObjWdsForm = document.getElementById("WdsForm");
	if(ObjWdsForm == null)
		ObjWdsForm = document.forms[0];
}

function onPageUnloadGlobal(i_event) {
	HidePleaseWait();
	if (typeof(onPageUnload) != "undefined") {
		onPageUnload();
	}
}

function onPageLoadGlobal() {
	var clForm;
	
	// Setting a handler for the unload event is necessary for Firefox because when going back to a page using
	// the browser's Back button, the Dom is restored to its last state, which could be the "please wait" message
	// if it had been displayed.
	// Safari keeps any setTimeout call active after we go to another page.  When we go back to the previous page
	// using the browser's Back button, the "Please wait..." message is displayed after a few seconds.  Simply setting
	// a handler for the unload event, even if the handler does nothing, seems to solve this issue.
	if (PWdsapp_eBrowser == GJSSYS_BROWSER_FIREFOX || PWdsapp_eBrowser == GJSSYS_BROWSER_SAFARI) {
		try {
			window.addEventListener("beforeunload", onPageUnloadGlobal, false);
		}
		catch (ex) {
		}
	}

	// Get Wds Form from its Id 
	initWdsFormObj();

	// Reset all form variables back to original values (when HTML was loaded).
	clForm = ObjWdsForm;	
	clForm.reset();

	// Ensure the <select> fields are OK with the back button.
	// For each of the <select> elements
	var aSelects = document.getElementsByTagName("select");
	for (var nSelects = 0; nSelects < aSelects.length; nSelects++) {
		// If that select element exists and has some <option> elements
		var objSelect = aSelects[nSelects];
		if (objSelect.selectedIndex >= 0) {  
			// if there is a selection 
			if (objSelect != null && objSelect.options != null) {
				// If the selected item is not the default item
				if (!objSelect.options[objSelect.selectedIndex].defaultSelected) {
					// Search through all the options and select the default item.
					for (var nIndex = 0; nIndex < objSelect.length; nIndex++) {
						if (objSelect.options[nIndex].defaultSelected) {
							objSelect.selectedIndex = nIndex;
						}
					}
				}
			}
		}
	}

	if (clForm.sCS_AppPath != undefined) {
		G_strRootPath = clForm.sCS_AppPath.value;
	}

	// Compatibility layer for Netscape to test scroll position
	if (document.layers) {
		// This works only for Netscape
		document.body = new Object;
		setInterval("testScroll();", 100);
	}
	setWDSScroll();
	
	// Set focus to the Actions menu
	var actBtn = document.getElementById( "ActBtn" );
	if (actBtn != null) {
		myfocus(actBtn);
	}
		
	// Set the tableau size (if possible)
	var cell4 = document.getElementById( "cell4" );
	var actDiv = document.getElementById( "ActDiv" );
	if (actDiv != null && cell4 != null 
		&& clForm.CS_TableauHeight != undefined 
		&& clForm.CS_TableauWidth != undefined 
		&& clForm.CS_ActiveXEnabled != undefined)
	{
		// Determine the size of the client (<body>) area.
		var clientWidth;
		var clientHeight;
		if (window.innerWidth == undefined) {
			// IE
			clientWidth = document.body.clientWidth;
			clientHeight = document.body.clientHeight;
		}
		else {
			// NN
			clientWidth = window.innerWidth;
			clientHeight = window.innerHeight;
		}
		var height = clientHeight;
		var width = clientWidth;

		// Remove the effects of custom controls.
		// Toolbar
		var cell = document.getElementById("cell1");
		if (cell != null && cell.childNodes.length > 0) {
			height -= cell.offsetHeight;
		}
		// Footer
		cell = document.getElementById("cell5");
		if (cell != null && cell.childNodes.length > 0) {
			height -= cell.offsetHeight;
		}
		// Menu
		cell = document.getElementById("cell2");
		if (cell != null && cell.childNodes.length > 0) {
			width -= cell.offsetWidth;
		}
		// Sidebar
		cell = document.getElementById("cell6");
		if (cell != null && cell.childNodes.length > 0) {
			width -= cell.offsetWidth;
		}

		// Determine the absolute position of the bottom of the Action button div.
		cell = actDiv;
		var actDivPosY = 0;
		while (cell != null) {
			actDivPosY += cell.offsetTop;
			cell = cell.offsetParent;
		}
		actDivPosY += actDiv.offsetHeight;

		// Determine the absolute postion of the top of cell4.
		cell = cell4;
		var cell4PosY = 0;
		while (cell != null) {
			cell4PosY += cell.offsetTop;
			cell = cell.offsetParent;
		}

		// Subtract the the Action button div height from the height of cell4.
		height -= (actDivPosY - cell4PosY);

		// Store the tableau size.
		clForm.CS_TableauHeight.value = height;
		clForm.CS_TableauWidth.value = width;
		
		clForm.CS_ActiveXEnabled.value = PWdsapp_bActiveXEnabled;
	}
}

// Launch the ASP page that lists the tables.
function ListTables() {
	if (typeof(ObjWdsForm) == 'undefined') {
		location = G_strRootPath + "/ReportFolders/reportFolders.aspx";
	}
	else {
		ObjWdsForm.CS_InHelp.value = "False";
		if (typeof(ObjWdsForm.sRF_Task) == 'undefined'
			|| ObjWdsForm.sRF_Task.value != '2')
		{
			ObjWdsForm.action = G_strRootPath + "/ReportFolders/reportFolders.aspx";
		}
		else { // advanced search page
			ObjWdsForm.action = G_strRootPath + "/ReportFolders/AdvancedSearch.aspx";
		}
		executeWait(ObjWdsForm);
	}
}

// Return the current dimension
function GetCurrentDim() {
	if (document != null && ObjWdsForm != null && ObjWdsForm.sWD_ActiveDim != null ) {
		return ObjWdsForm.sWD_ActiveDim.value;
	}
	else {
		return 0;
	}
}

// Return the highest dimension
function GetMaxDim() {
	if (typeof(ObjWdsForm) == "undefined") {
		alert(resTableNoLoaded);
		return -1; // return an error indication
	}
	return ObjWdsForm.sWD_MaxDim.value;
}

function SpawnWindow()
{
	var strOldTarget;
	var wndSummary;
	var bSpawn = false;
	var strSummaryPage = "_WdsSummary";
	var strSummaryPath = "/TableViewer/summary.aspx";

	if (typeof(ObjWdsForm.sCS_SpawnWindow) != "undefined") {
		bSpawn = ObjWdsForm.sCS_SpawnWindow.value == "True" ? true : false;
	}
	if (bSpawn) {
		GenerateNewWindow(strSummaryPage, strSummaryPath);
	}

	return bSpawn;
}

//==============================================================================
// COMMON EVENT HANDLER FUNCTIONS

function OnLogin() {
	try {
		if (typeof(SaveSelectionState) != "undefined") {
			SaveSelectionState();
		}
	}
	catch (ex) {
	}

	var strDocumentPath = document.location.pathname;
	var astrDocumentPathTemp = strDocumentPath.split("/");
	var nFolders = astrDocumentPathTemp.length;
	var strCurrentPage = "";
	if (typeof(gCurrentPage) != "undefined") {
		strCurrentPage = gCurrentPage;
	}
	if (astrDocumentPathTemp[nFolders - 1].toLowerCase() != strCurrentPage.toLowerCase()) {
		ObjWdsForm.CS_TargetPage.value = strDocumentPath;
	}
	else if (strCurrentPage.toLowerCase() == "login.aspx" || strCurrentPage.toLowerCase() == "register.aspx") {
		ObjWdsForm.CS_TargetPage.value = ObjWdsForm.LG_targetpage.value;
	}

	var strPage = "";
	if (astrDocumentPathTemp[nFolders - 1].toLowerCase() != strCurrentPage.toLowerCase()) {
		strPage = strDocumentPath;
	}
	else if (ObjWdsForm.CS_TargetPage.value != "undefined" && ObjWdsForm.CS_TargetPage.value != "") {
		strPage = ObjWdsForm.CS_TargetPage.value;
	}
	CreateHiddenFormField(ObjWdsForm, "LG_targetpage", strPage);
	CreateHiddenFormField(ObjWdsForm, "LG_reprompt", "");
	
	var strQueryString = document.location.search;
	ObjWdsForm.action = G_strRootPath + "/Common/Login/Login.aspx" + strQueryString;

	//clicking Login on the Logout page?
	if(document.location.href.toLowerCase().indexOf("/common/login/logout.aspx")>0) {
		ObjWdsForm.CS_TargetPage.value = document.location.href.replace("/Common/Login/logout.aspx", "/ReportFolders/reportFolders.aspx");
		ObjWdsForm.LG_targetpage.value = ObjWdsForm.CS_TargetPage.value;
		ObjWdsForm.action = document.location.href.replace("/Common/Login/logout.aspx", "/Common/Login/Login.aspx");
	}

	ObjWdsForm.CS_InHelp.value = "False";
	executeWait(ObjWdsForm);
}

function OnLogout() {
	//CUSTOMIZATION: replace the line below if you wish the "Sign out" button to go somewhere else
	ObjWdsForm.action = G_strRootPath + "/Common/Login/logout.aspx";
	
	CreateHiddenFormField(ObjWdsForm, "IF_ActiveFolder", "0"); //move to the root of Public Reports
	CreateHiddenFormField(ObjWdsForm, "sRF_ActivePath", "P");

	RemoveFormField(ObjWdsForm, "sWD_ReportId"); //logging out will close any report that may be opened
	RemoveFormField(ObjWdsForm, "sEV_ReportId"); 

	executeWait(ObjWdsForm);
}

function RegisterUser(i_strURL) {
	var strQueryString = document.location.search;
	ObjWdsForm.CS_InHelp.value = "False";
	if(i_strURL != undefined) CreateHiddenFormField(ObjWdsForm,"LG_targetpage",i_strURL); //go to this URL on success
	ObjWdsForm.action = G_strRootPath + "/Common/Login/register.aspx" + strQueryString;
	executeWait(ObjWdsForm);
}

function PasswordRecovery() {
	var objName = document.getElementsByName("LG_logintemp")[0];
	if (objName.value == undefined || objName.value == "") {
		alert(resEnterName);
		return;
	}
	if (!confirm(resPasswordWillBeMailed)) {
		return;
	}
	var strUserName = objName.value.toLowerCase();
	var clRequest = new wdsRequest();
	clRequest.Handler = NotifyPasswordRecovery;
	clRequest.ExecRecoverPassword(strUserName);
}

function NotifyPasswordRecovery() {
	if (typeof(ObjWdsForm.LG_targetpage) == "undefined") {
		ObjWdsForm.action = G_strRootPath + "/ReportFolders/reportFolders.aspx";
	}
	else {
		ObjWdsForm.action = ObjWdsForm.LG_targetpage.value;
	}
	executeWait(ObjWdsForm);
}

function OnDataBank() {
	RemoveFormField(ObjWdsForm, "sWD_AssumeOwner");
	if (typeof (gnMapDim) != "undefined") {
		gnMapDim = -1;
	}
	if (typeof(zeroScrollPosition) != "undefined") {
		zeroScrollPosition();
	}
	if (typeof(SaveSelectionState) != "undefined") {
		SaveSelectionState();
	}
	ListTables();
}

function ShowNavMap()
{
	ObjWdsForm.CS_InHelp.value = "False";
	ObjWdsForm.action = G_strRootPath + "/NavMaps/navMap.aspx";
	executeWait(ObjWdsForm);
}

function OnActivateProfile() {
	var strDocumentPath;
	
	// Any changes made to any item should be save to the hidden fields
	if (typeof(SaveSelectionState) != 'undefined') {
		SaveSelectionState();
	}
	
	strDocumentPath = document.location.pathname;
	ObjWdsForm.PR_NextPage.value = strDocumentPath;
	ObjWdsForm.PR_Mode.value = 1;
	ObjWdsForm.action = G_strRootPath + "/Common/Profiles/UserProfiles.aspx";
	executeWait(ObjWdsForm);
}

function OnDeleteProfile() {
	var strDocumentPath;

	strDocumentPath = document.location.pathname;

	//Profile is activated from the view dimension page,therefore, profile has to be activated and applied.
	ObjWdsForm.PR_NextPage.value = strDocumentPath;
	ObjWdsForm.PR_Mode.value = 2;
	ObjWdsForm.action = G_strRootPath + "/Common/Profiles/UserProfiles.aspx";
	executeWait(ObjWdsForm);
}

function OnActivateProfileTab()
{
	ObjWdsForm.PR_NextPage.value = ObjWdsForm.PR_NextPage.value;
	ObjWdsForm.PR_Mode.value = 1;
	ObjWdsForm.CS_InHelp.value = "False";
	ObjWdsForm.action = G_strRootPath + "/Common/Profiles/UserProfiles.aspx";
	executeWait(ObjWdsForm);
}

function OnDeleteProfileTab()
{
	//Profile is activated from the view dimension page,therefore, profile has to be activated and applied.
	ObjWdsForm.PR_NextPage.value = ObjWdsForm.PR_NextPage.value;
	ObjWdsForm.PR_Mode.value = 2;
	ObjWdsForm.CS_InHelp.value = "False";
	ObjWdsForm.action = G_strRootPath + "/Common/Profiles/UserProfiles.aspx";
	executeWait(ObjWdsForm);
}

function OnSaveProfile() {
	ObjWdsForm.CS_InHelp.value = "False";
	ObjWdsForm.CS_SaveMode.value = "True"; 
	ObjWdsForm.PR_Mode.value = 3;

	//verify the number of items selected is valid
	var clItemSelControl = ItemSelection_Controls["ItemSelectionCtl"];
	if (clItemSelControl != null && ObjWdsForm.sWD_MaxProfileItems != null ) {
		var nMaxProfileItems = ObjWdsForm.sWD_MaxProfileItems.value;
		var nSelectedItemCount = clItemSelControl.GetSelectionCountIncludeGroups();

		if (nSelectedItemCount > nMaxProfileItems) {
			var strMessage = resTooManyItemsSelectedForProfile + " " + nMaxProfileItems + ". " + resYouHaveSelected + " " + nSelectedItemCount + " " + resSpaceItems;
			alert(strMessage);
			return;
		}
	}

	var strUrl = G_strRootPath + "/Common/Profiles/UserProfiles.aspx";
	if (IsLoggedIn()) {
		ObjWdsForm.action = strUrl;
	}
	else {
		CreateHiddenFormField(ObjWdsForm, "LG_targetpage", strUrl);
		ObjWdsForm.action = G_strRootPath + "/Common/Login/Login.aspx";
	}
	executeWait(ObjWdsForm);
}

function OnDeactivateProfile() {
	CreateHiddenFormField(ObjWdsForm, "PR_Command", "DeactivateAllProfiles");
	CreateHiddenFormField(ObjWdsForm, "PR_Mode", 0);
	ObjWdsForm.action = RemoveQueryString(document.location.href);
	executeWait(ObjWdsForm);
}

function OnActivateThisProfile(i_nProfileId) {
	CreateHiddenFormField(ObjWdsForm, "PR_Command", "ActivateProfile");
	CreateHiddenFormField(ObjWdsForm, "PR_ProfileId", i_nProfileId);
	CreateHiddenFormField(ObjWdsForm, "WD_Command", "ActivateProfile");
	CreateHiddenFormField(ObjWdsForm, "WD_ProfileId", i_nProfileId);
	ObjWdsForm.action = RemoveQueryString(document.location.href);
	executeWait(ObjWdsForm);
}

function OnDeactivateThisProfile(i_nProfileId) {
	CreateHiddenFormField(ObjWdsForm, "PR_Command", "DeactivateProfile");
	CreateHiddenFormField(ObjWdsForm, "PR_ProfileId", i_nProfileId);
	CreateHiddenFormField(ObjWdsForm, "WD_Command", "DeactivateProfile");
	CreateHiddenFormField(ObjWdsForm, "WD_ProfileId", i_nProfileId);
	ObjWdsForm.action = RemoveQueryString(document.location.href);
	executeWait(ObjWdsForm);
}

//returns the URL it receives, but without the question mark and anything after it
function RemoveQueryString(i_strURL) {
	var nPos = i_strURL.indexOf('?');
	if (nPos < 0) return i_strURL;
	return i_strURL.substring(0, nPos);
}

function OnContactUs() {
	try {
		if (typeof(SaveSelectionState) != "undefined") {
			SaveSelectionState();
		}
	}
	catch (ex) {
	}

	var strDocumentPath;
	var astrDocumentPathTemp;
	var nNumberOfFolders = 0;
	var strCurrentPage = ""

	strDocumentPath = document.location.pathname;

	astrDocumentPathTemp = strDocumentPath.split("/");
	nNumberOfFolders = astrDocumentPathTemp.length;

	if (typeof(gCurrentPage) != "undefined") {
		strCurrentPage = gCurrentPage;
	}
	if (astrDocumentPathTemp[nNumberOfFolders - 1].toLowerCase() != strCurrentPage.toLowerCase()) {
		ObjWdsForm.CS_TargetPage.value = strDocumentPath;
	}
	else if (strCurrentPage.toLowerCase() == "login.aspx" || strCurrentPage.toLowerCase() == "register.aspx") {
		ObjWdsForm.CS_TargetPage.value = ObjWdsForm.LG_targetpage.value;
	}
	ObjWdsForm.action = G_strRootPath + "/Common/ContactUs/ContactUs.aspx";
	ObjWdsForm.CS_InHelp.value = "False";
	executeWait(ObjWdsForm);
}

function GenerateNewWindow(strPageName, strPagePath)
{
	var strOldTarget = ObjWdsForm.target;
	var strOldAction = ObjWdsForm.action;
	var wndNew;

	if (PWdsapp_bIsIE) {
		ObjWdsForm.target = strPageName;
	}
	else {
		wndNew = window.open("", strPageName, "");
		ObjWdsForm.target = wndNew.name;
	}

	ObjWdsForm.action = G_strRootPath + strPagePath;
	ObjWdsForm.submit();
	ObjWdsForm.target = strOldTarget;
	ObjWdsForm.action = strOldAction;
	if (!PWdsapp_bIsIE) {
		wndNew.focus();
	}
}

function IsSpawnWindow()
{
	var bSpawn = false;
	if (typeof(ObjWdsForm.sCS_SpawnWindow) != "undefined") {
		bSpawn = ObjWdsForm.sCS_SpawnWindow.value == "True" ? true : false;
	}
	return bSpawn;
}

function onCloseHelp() {
	if (IsSpawnWindow()) {
		this.close();
	}
	else {
		//no need to set the action, it's the same page we are on
		ObjWdsForm.CS_InHelp.value = "False";
		executeWait(ObjWdsForm);
	}	
}

function OnTutorials()
{
	var bOnTab=!IsSpawnWindow(); 
	try {
		if (typeof(SaveSelectionState) != "undefined") {
			if (bOnTab) 
				SaveSelectionState();
		}
	}
	catch (ex) {
	}

   OpenHelpWindow("tutorials.htm", bOnTab);
}

function OnHome(i_strURL)
{
	ObjWdsForm.action = G_strRootPath + i_strURL;
	ObjWdsForm.CS_InHelp.value = "False";
	executeWait(ObjWdsForm);
}

function OnReports() {
	if (typeof(gnMapDim) != "undefined") {
		gnMapDim = -1;
	}
	if (typeof(ObjWdsForm.sRF_Task) != 'undefined' && ObjWdsForm.sRF_Task != null) {
		ObjWdsForm.sRF_Task.value = 0; //TASK_BROWSE (just in case we are in advanced search)
	}

	//if we were in save mode, return to normal browse mode
	CreateHiddenFormField(ObjWdsForm, "IF_Mode", "0");
	RemoveFormField(ObjWdsForm, "sWD_AssumeOwner");	
	
	ObjWdsForm.action = G_strRootPath + "/ReportFolders/reportFolders.aspx";
	ObjWdsForm.CS_InHelp.value = "False";
	executeWait(ObjWdsForm);
}

function OnNews()
{
	var strDocumentPath;
	var astrDocumentPathTemp;
	var nNumberOfFolders = 0;
	var strCurrentPage = ""

	try {
		if (typeof(SaveSelectionState) != "undefined") {
			SaveSelectionState();
		}
	}
	catch (ex) {
	}

	strDocumentPath = document.location.pathname;

	astrDocumentPathTemp = strDocumentPath.split("/");
	nNumberOfFolders = astrDocumentPathTemp.length;

	if (typeof(gCurrentPage) != "undefined") {
		strCurrentPage = gCurrentPage;
	}
	if (astrDocumentPathTemp[nNumberOfFolders - 1].toLowerCase() != strCurrentPage.toLowerCase()) {
		ObjWdsForm.CS_TargetPage.value = strDocumentPath;
	}
	else if (strCurrentPage.toLowerCase() == "login.aspx" || strCurrentPage.toLowerCase() == "register.aspx") {
		ObjWdsForm.CS_TargetPage.value = ObjWdsForm.LG_targetpage.value;
	}
	ObjWdsForm.action = G_strRootPath + "/Common/News/News.aspx";
	ObjWdsForm.CS_InHelp.value = "False";
	executeWait(ObjWdsForm);
}

function OnPublish() {
	CleanupRearrangeFields();
	ObjWdsForm.CS_InHelp.value = "False";
	ObjWdsForm.action = G_strRootPath + "/Publisher/Publisher.aspx";
	CreateHiddenFormField(ObjWdsForm,"PB_CleanupState","Yes");
	executeWait(ObjWdsForm);
}

function OnManageReports() {
	CleanupRearrangeFields();
	CreateHiddenFormField(ObjWdsForm, "sRM_SelectAll", "");
	CreateHiddenFormField(ObjWdsForm, "sRM_RootFolder", "0");
	ObjWdsForm.CS_InHelp.value = "False";
	ObjWdsForm.action = G_strRootPath + "/Publisher/ManageReports.aspx";
	CreateHiddenFormField(ObjWdsForm,"RM_CleanupState","Yes");
	executeWait(ObjWdsForm);
}

function OnAdmin() {
	CleanupRearrangeFields();
	ObjWdsForm.CS_InHelp.value = "False";
	ObjWdsForm.action = G_strRootPath + "/Admin/Admin.aspx";
	CreateHiddenFormField(ObjWdsForm,"AD_CleanupState","Yes");
	executeWait(ObjWdsForm);
}

function OnAnalysisTool() {
	CleanupRearrangeFields();
	ObjWdsForm.CS_InHelp.value = "False";
	CreateHiddenFormField(ObjWdsForm,"sAT_PrintableVersion","");
	ObjWdsForm.action = G_strRootPath + "/AnalysisTool/AnalysisTool.aspx";
	CreateHiddenFormField(ObjWdsForm,"AT_CleanupState","Yes");
	executeWait(ObjWdsForm);
}

//==============================================================================
// HELP RELATED FUNCTIONS
function OpenHelpWindow(i_strHelpPage, bOnTab, i_strAnchor) {
	var strLocation = "";
	var strHelpPage = i_strHelpPage;
	var strAnchor = "";

	var bFramesInHelp = AreFramesInHelp();
	if (typeof(i_strAnchor) != "undefined") strAnchor = i_strAnchor.toLowerCase();
	if (bOnTab) {
		if (bFramesInHelp) {
			// Open Help window in-place (as parent window)
			ObjWdsForm.CS_InHelp.value = "True";
			if (strAnchor != "") strHelpPage += "#" + strAnchor;
			ObjWdsForm.CS_HelpPage.value = strHelpPage;
			ObjWdsForm.action = document.location.pathname;
			executeWait(ObjWdsForm);
		}
		else {
			// Open Help window in-place (as parent window)
			location = G_strRootPath + "/Common/HelpNoFrames/" + G_strLanguage + "/wds.htm#" + strHelpPage.substr(0, strHelpPage.length - 4);
		}
	}
	else {
		if (bFramesInHelp) {
			strLocation = "/Common/Help/help.aspx?HelpPage=" + strHelpPage;
			if (strAnchor != "") strLocation += "&HelpAnchor=" + strAnchor;
			strLocation += "&sCS_ChosenLang=" + G_strLanguage;
			GenerateNewWindow("WDSHelp", strLocation);
		}
		else {
			// Open Help window in-place (as parent window)
			strLocation = G_strRootPath + "/Common/HelpNoFrames/" + G_strLanguage + "/wds.htm#" + strHelpPage.substr(0, strHelpPage.length - 4);
			window.open(strLocation, "WDSHelp", "");
		}
	}
}

//i_strSpecialFolder should be "Admin" or "Pub" or "Analysis"
function OpenHelpWindowSpecial(i_strHelpPage, bOnTab, i_strAnchor,i_strSpecialFolder)
{
	var strLocation = "/Common/Help/help.aspx?HelpPage=" + i_strHelpPage;
	if (typeof(i_strAnchor) != "undefined" && i_strAnchor != "") strLocation += "&HelpAnchor=" + i_strAnchor.toLowerCase();
	strLocation += "&sCS_ChosenLang=" + G_strLanguage;
	strLocation += "&SpecialFolder=" + i_strSpecialFolder;
	GenerateNewWindow("WDSHelp", strLocation);
}

function AreFramesInHelp()
{
	var bFramesInHelp = true;
	if (typeof(ObjWdsForm.CS_FramesInHelp) != "undefined") {
		bFramesInHelp = ObjWdsForm.CS_FramesInHelp.value.toLowerCase() == "true" ? true : false;
	}
	return bFramesInHelp;
}

// In the case of required login, user will be redirected to the login page.
function ReDirectToLoginPage() {
	var strQueryString = document.location.search;
	onPageLoadGlobal();
	ObjWdsForm.LG_targetpage.value = document.location.pathname + strQueryString

	//CUSTOMIZATION: replace the line below if you have created your own login page and wish to redirect back there on incorrect username/password
	//To create a custom login page just add a form containing <input id="username" type="text" name="LG_login" value="" /><input id="username" type="text" name="LG_pwd" value="" />
	ObjWdsForm.action = G_strRootPath + "/Common/Login/Login.aspx";

	ObjWdsForm.CS_InHelp.value = "False";
	executeWait(ObjWdsForm);
}

// This function creates the cell footer tables for the Printable Version of the table.
function footerTables(){
	var nRow = 0;
	var footer = document.getElementById("cell5");
	var footerTable = null;
	var linkTag = null;

	if ( footer != null ) {
		footerTable = document.body.appendChild(document.createElement("Table"));

		footerTable.setAttribute("id", "FooterTable", 0);  
		footerTable.insertRow(nRow);

		footerTable.rows[nRow].insertCell(0);
		footerTable.rows[nRow].cells[0].appendChild(footer); 
		footerTable.rows[nRow].cells[0].style.visibility = "visible";

		// Remove all the links from the footer
		removeHref(footerTable);
	}
	return footerTable;
}

// Remove all the href links for a specified element.
function removeHref(objElement){
	var linkTag = null;

	// Remove all the links from the footer
	linkTag = objElement.getElementsByTagName("A");
	if (linkTag.length > 0) {
		for (var Index = linkTag.length - 1; Index >= 0; Index--) {
			if (linkTag[Index].removeAttribute("href", 0)) {
				linkTag[Index].style.textDecoration = "underline";
			}
		}
	}
}

// This function creates a hidden field if necessary; it will replace the current value if the field is already there
function CreateHiddenFormField(i_clForm, i_strFieldName, i_strFieldValue) {
	// We have to check the parentNode because Firefox reports deleted fields as objects.
	if (typeof(i_clForm[i_strFieldName]) == "undefined" || i_clForm[i_strFieldName].parentNode == null) {
		var clInputTag = document.createElement("input");
		clInputTag.setAttribute("type", "hidden", 0);
		clInputTag.setAttribute("name", i_strFieldName, 0);
		clInputTag.setAttribute("id", i_strFieldName, 0);
		clInputTag.setAttribute("value", i_strFieldValue, 0);
		i_clForm.appendChild(clInputTag);
	}
	else {
		i_clForm[i_strFieldName].value = i_strFieldValue;
	}
}

//this function creates a hidden field; it does not care if the field is already there, it always creates a new one 
function AddHiddenFormField(i_clForm, i_strFieldName, i_strFieldValue) {
	var clInputTag = document.createElement("input");
	clInputTag.setAttribute("type", "hidden", 0);
	clInputTag.setAttribute("name", i_strFieldName, 0);
	clInputTag.setAttribute("value", i_strFieldValue, 0);
	i_clForm.appendChild(clInputTag);
}

function ReadHiddenFormField(i_clForm, i_strFieldName, i_oDefaultValue) {
	var clField = i_clForm[i_strFieldName];
	return (clField == undefined) ? i_oDefaultValue : clField.value;
}

function RemoveFormField(i_clForm, i_strName) {
	var aclFields = i_clForm[i_strName];
	if (aclFields != undefined) {
		if (aclFields.length == undefined) {
			if (aclFields.parentNode != null) {
				aclFields.parentNode.removeChild(aclFields);
			}
		}
		else {
			var clField;
			var nFieldCount = aclFields.length;
			for (var nIndex = nFieldCount - 1; nIndex >= 0; nIndex--) {
				clField = aclFields[nIndex];
				if (clField.parentNode != null) {
					clField.parentNode.removeChild(clField);
				}
			}
		}
	}
}

// This function creates a string from the FORM hidden input field values, so that it can be posted to the server.
function CreateHttpRequest(i_clForm) {
	var aclFormFields;
	var bAddToRequest;
	var clFormField;
	var strRequest = "";
	var unIndex;
	var unFieldCount = 0;

	// Make sure the form object is defined.
	if (i_clForm != undefined) {
		aclFormFields = i_clForm.getElementsByTagName("INPUT");
		// For each INPUT form field of type hidden, create a string "name=value".  Join all of
		// these strings with the "&" character.  The result will look something
		// like: "sWD_TableId=1&sWD_ChartType=5&PR_ProfileApplied=False".
		for (unIndex = 0; unIndex < aclFormFields.length; unIndex++) {
			clFormField = aclFormFields[unIndex];
			if (clFormField.type.toLowerCase() == "hidden") {
				// Don't add "&" if it's the first INPUT tag found.
				if (unFieldCount > 0) {
					strRequest += "&";
				}
				strRequest += clFormField.name + "=";
				strRequest += URIencode(clFormField.value);
				unFieldCount++;
			}
		}
	}

	return strRequest;
}

function OnChangePassword()
{
	var strDocumentPath;
	var astrDocumentPathTemp;
	var nNumberOfFolders = 0;
	var strCurrentPage = ""

	strDocumentPath = document.location.pathname;

	astrDocumentPathTemp = strDocumentPath.split("/");
	nNumberOfFolders = astrDocumentPathTemp.length;

	if (typeof(gCurrentPage) != "undefined") {
		strCurrentPage = gCurrentPage;
	}
	if (astrDocumentPathTemp[nNumberOfFolders - 1].toLowerCase() != strCurrentPage.toLowerCase()) {
		ObjWdsForm.CS_TargetPage.value = strDocumentPath;
	}
	else if (strCurrentPage.toLowerCase() == "login.aspx" || strCurrentPage.toLowerCase() == "register.aspx") {
		ObjWdsForm.CS_TargetPage.value = ObjWdsForm.LG_targetpage.value;
	}	         
	ObjWdsForm.action = G_strRootPath + "/Common/Login/ChangePassword.aspx";
	ObjWdsForm.CS_InHelp.value = "False";
	executeWait(ObjWdsForm);
}

//This function is invoked if the administrator requires strong passwords on the page Admin/Preferences.aspx.
//Enable/disable any tests by commenting them out or removing the comment signs.
//You can also implement any additional tests here to match your organization's policies.
//If a test fails, it should display a message and return false. If you add custom tests, define the corresponding
//messages in the strings.*.txt files and run mkresall.bat
function VerifyStrongPassword(strPassword, strUserName)
{
	//test 1 - at least 4 characters
	if(strPassword.length < 4)
	{
		alert(resPasswordTooShort);
		return false;
	}

	//test 2 - not all characters identical
	var cFirst = strPassword.charAt(0);
	var bTest2Passes = false;
	for(var i=1; i<strPassword.length; i++) 
	{
		if(strPassword.charAt(i) != cFirst)
		{
			bTest2Passes = true;
			break;
		}
	}	 
	if(!bTest2Passes)
	{	
		alert(resPasswordCharactersIdentical);
		return false;
	}	
	
	/*
	//Tests 3..5 are commented out by default because very strong passwords are hard to remember.
	
	//this code is necessary if you wish to use test 3 or test 4 or test 5
	var bFoundDigit = false;
	var bFoundUpper = false;
	var bFoundLower = false;
	var bFoundSpecial = false;
	for (var i = 0; i < strPassword.length; i++) {
		var c = strPassword.charAt(i);
		if(IsUpper(c)) bFoundUpper = true;
		else if(IsLower(c)) bFoundLower = true;
		else if(IsDigit(c)) bFoundDigit = true;
		else bFoundSpecial = true;
	}

	//test 3 - at least one letter and one digit
	var bFoundLetter = bFoundUpper || bFoundLower;
	if(!bFoundLetter || !bFoundDigit) {
		alert(resPasswordLetterDigit);
		return false;
	}	
	
	//test 4 - at least one uppercase letter and one lowercase letter
	if(!bFoundUpper || !bFoundLower)
	{
		alert(resPasswordUpperLower);
		return false;
	}	

	//test 5 - at least one character that is neither a letter or a digit
	if(!bFoundSpecial) {
		alert(resPasswordSpecialChar);
		return false;
	}
	
	*/
	
	//test 6 - password not the same as the username
	if(strUserName == strPassword)
	{
		alert(resPasswordMustNotMatchUserName);
		return false;
	}

	//passed all tests, return success
	return true;
}

function IsUpper(c) { return c>="A" && c<="Z"; }
function IsLower(c) { return c>="a" && c<="z"; }
function IsDigit(c) { return c>="0" && c<="9"; }

// Return the current event object.
function GetEvent(
	i_clEvent
	)
{
	// For DOM Level 2 event-handling, the event object is passed as a parameter to the
	// event-handler.  So if the event object passed here as a parameter is not null, simply
	// return it.
	if (i_clEvent != null) {
		return i_clEvent;
	}
	// For IE event-handling, we need to get the event object from the window object.
	else if (typeof(window.event) != "undefined") {
		return window.event;
	}
	else {
		return null;
	}
}

// Stop the event from being propagated to parent or child objects.
function StopEventPropagation(
	i_clEvent
	)
{
	var clEvent = null;
	
	clEvent = GetEvent(i_clEvent);

	if (clEvent != null) {
		if (clEvent.stopPropagation) {
			clEvent.stopPropagation();		// DOM Level 2
		}
		else {
			clEvent.cancelBubble = true;	// IE
		}
	}
}

// Prevent the default action of the event from occuring.
function PreventEventDefaultAction(
	i_clEvent
	)
{
	var clEvent = null;
	
	clEvent = GetEvent(i_clEvent);

	if (clEvent != null) {
		if (clEvent.preventDefault) {
			clEvent.preventDefault();		// DOM Level 2
		}
		else {
			clEvent.returnValue = false;	// IE
		}
	}
}

//----------------------------- menus -----------------------
function OnExtractActionsButton() 
{ 	
	ToggleMenu("MenuCell_ExtractActions"); 
}

function OnRFActionsButton() 
{ 	
	ToggleMenu("MenuCell_RFActions"); 
}

function OnProfilesActionsButton() 
{ 	
	ToggleMenu("MenuCell_ProfilesActions"); 
}

function OnProfilesButton() 
{ 	
	ToggleMenu("MenuCell_Profiles"); 
}

function OnSelectionButton() 
{ 	
	ToggleMenu("MenuCell_Selection"); 
}

function OnChartTypesButton() 
{ 	
	ToggleMenu("MenuCell_ChartTypes"); 
}

function OnDownloadButton() 
{ 	
	ToggleMenu("MenuCell_Download"); 
}

function OnTotalsButton() 
{ 	
	ToggleMenu("MenuCell_Totals"); 
}

function OnUsefulLinksButton() 
{ 	
	ToggleMenu("MenuCell_UsefulLinks"); 
}

function OnLanguageButton() 
{ 	
	ToggleMenu("MenuCell_Lang"); 
}

function OnRequestedLang(lang) {
	try {
		if (typeof(SaveSelectionState) != "undefined") {
			SaveSelectionState();
		}
	}
	catch (ex) {
	}
	if (typeof (ObjWdsForm.sEV_ExpandString) != "undefined") { //if in an extract, collapse all categories 
		ObjWdsForm.sEV_ExpandString.value = "";
	}		
	ObjWdsForm.CS_langSwitch.value = "True";
	ObjWdsForm.sCS_ChosenLang.value = lang;
	ObjWdsForm.action = document.location.pathname;
	executeWait(ObjWdsForm);
}

//shows the specified menu
function ShowMenu(strCellId)
{
	var clMenu = document.getElementById(strCellId+"Div");

	if (clMenu != null) {
		hideObjectElements();
		clMenu.style.visibility = "visible";
		clMenu.style.display = "block";

		//align right instead of left if necessary (e.g. Toolbar Links with a very long link text)
		var windowWidth = (typeof(window.innerWidth) == "undefined")?document.body.clientWidth:window.innerWidth;
		var menuOffset = GetOffSet(clMenu, OFFSET_LEFT)
		if (menuOffset + clMenu.offsetWidth > windowWidth) {
			clMenu.setAttribute(PWdsapp_bBrowserClassname ? "className" : "class", "menu right", 0);
		}
		else {
			clMenu.setAttribute(PWdsapp_bBrowserClassname ? "className" : "class", "menu", 0);
		}
	}
}

function HideMenu(strCellId)
{
   var clCell = document.getElementById(strCellId);
   var clDiv = document.getElementById(strCellId + "Div");

   if(clCell != null && clDiv != null) {
	   showObjectElements();
      clDiv.style.visibility = "hidden";
      clDiv.style.display = "none";
   }
}   

//hides the menu if visible; makes it visible if hidden
function ToggleMenu(strCellId)
{
   var clCell = document.getElementById(strCellId);
   var clDiv = document.getElementById(strCellId + "Div");

   if(clCell != null && clDiv != null) {
      if (clDiv.style.display != "none") { //it's visible
			HideMenu(strCellId);
      }
      else {
			HideAllMenus();
			ShowMenu(strCellId);
      }
   }
}   

//getElementsByName("MenuCell") would have offered a nicer solution here, but it didn't work in IE 7 RC1
function HideAllMenus()
{
	HideMenu("MenuCell_Lang");
	HideMenu("MenuCell_UsefulLinks");
	HideMenu("MenuCell_ExtractActions");
	HideMenu("MenuCell_RFActions");
	HideMenu("MenuCell_ProfilesActions");
	HideMenu("MenuCell_Selection");
	HideMenu("MenuCell_Profiles");
	HideMenu("MenuCell_ChartTypes");
	HideMenu("MenuCell_Download");
	HideMenu("MenuCell_Totals");
}

function Disabled() {
	HideAllMenus();
}

function OnOpenUsefulLink(strURL)
{
	HideMenu('MenuCell_UsefulLinks');
	window.open(strURL);
}

function M_pfnCalculateX(i_objDiv)
{
	var curleft = 0;
	if (i_objDiv.offsetParent)
	{
		while (i_objDiv.offsetParent)
		{
			curleft += i_objDiv.offsetLeft
			i_objDiv = i_objDiv.offsetParent;
		}
	}
	else if (i_objDiv.x) {
		curleft += i_objDiv.x;
	}

	return curleft;
}

function M_pfnCalculateY(i_objDiv)
{
	var curtop = 0;
	if (i_objDiv.offsetParent)
	{
		while (i_objDiv.offsetParent)
		{
			curtop += i_objDiv.offsetTop
			i_objDiv = i_objDiv.offsetParent;
		}
	}
	else if (i_objDiv.y) {
		curtop += i_objDiv.y;
	}

	return curtop;
}

function hideObjectElements()
{
	var aclObjectElements = document.getElementsByTagName("OBJECT");
	for (i=0; i < aclObjectElements.length; i++) {
		aclObjectElements[i].style.visibility= 'hidden';
	}
}

function showObjectElements()
{
	var aclObjectElements = document.getElementsByTagName("OBJECT");
	for (i=0; i < aclObjectElements.length; i++) {
		aclObjectElements[i].style.visibility= 'visible';
	}
}

//Speed optimization: removes hidden fields created if you have earlier visited the rearrange reports page. 
//No need to carry them on every page for the rest of the session.
function	CleanupRearrangeFields() {
	RemoveFormField(ObjWdsForm,"sRF_RearrangeCrtIds");
	RemoveFormField(ObjWdsForm,"sRF_RearrangeCrtChecked");
}

//returns true if the specified string is in the format YYYY-MM-DD HH:MM:SS and it's a valid date
function ValidateReportDate(i_strDate) 
{
	//validate the YYYY-MM-DD part
	if(i_strDate==null) return false;
	if(i_strDate.length!=19) return false;
	var c, oldC, year, month, day;
	c=i_strDate.charAt(0); if(c!='2') return false; //accept only dates after 2000
	c=i_strDate.charAt(1); if(!IsDigit(c)) return false;
	c=i_strDate.charAt(2); if(!IsDigit(c)) return false;
	c=i_strDate.charAt(3); if(!IsDigit(c)) return false;
	c=i_strDate.charAt(4); if(c!='-') return false;
	c=i_strDate.charAt(5); if(c!='0' && c!='1') return false; oldC=c;//accept only months like 01,02,...10,11,12
	c=i_strDate.charAt(6); if(!IsDigit(c)) return false; if(oldC=='1' && c!='0' && c!='1' && c!='2') return false; //reject 13, 14, ..., 19
	c=i_strDate.charAt(7); if(c!='-') return false;
	c=i_strDate.charAt(8); if(c!='0' && c!='1' && c!='2' && c!='3') return false; oldC=c;//accept only days like 01,02,...10,11,...,31
	c=i_strDate.charAt(9); if(!IsDigit(c)) return false;
	if(oldC=='0' && c=='0') return false; //day 00
	if(oldC=='3' && c!='0' && c!='1') return false; //day 32,33, ...
	c=i_strDate.charAt(10); if(c!=' ') return false;

	//the tests above allow dates like Feb 31, or Feb 29 in a non-leap year, or April 31
	year=parseInt(i_strDate.substring(0,4));
	month=parseInt(i_strDate.substring(5,7)); if(month==0) month=parseInt(i_strDate.substring(6,7)); //parseInt("08") is 0, very interesting...
	day=parseInt(i_strDate.substring(8,10)); if(day==0) day=parseInt(i_strDate.substring(9,10));
	if(month<1 || month>12) return false;
	if(day<1 || day>31) return false;
	if((month==4 || month==6 || month==9 || month==11) && day==31) return false;
	if(month==2) // February 29th
	{ 
		var isleap=(year%4==0 && (year%100!=0 || year%400==0));
		if (day>29 || (day==29 && !isleap)) return false;
	}
	
	//validate the HH:mm:SS part
	c=i_strDate.charAt(11); if(c!='0' && c!='1' && c!='2') return false; oldC=c; //hours are between 00,..,23
	c=i_strDate.charAt(12); if(!IsDigit(c)) return false; 
	if(oldC=='2' && c>'3') return false; //hour 24,25,...
	c=i_strDate.charAt(13); if(c!=':') return false;
	c=i_strDate.charAt(14); if(c<'0' || c>'5') return false; //minutes are between 00,..,59
	c=i_strDate.charAt(15); if(!IsDigit(c)) return false; 
	c=i_strDate.charAt(16); if(c!=':') return false;
	c=i_strDate.charAt(17); if(c<'0' || c>'5') return false; //seconds are between 00,..,59
	c=i_strDate.charAt(18); if(!IsDigit(c)) return false; 
	
	return true;
}

//Pass false to disable the button. We have to change its color explicitly for FireFox.
function ChangeButtonState(objButton, bDisabled) 
{
	objButton.disabled = bDisabled;
	objButton.setAttribute("class", bDisabled?"DimOrderGeneralTextGray":"DimOrderGeneralText");
}

function IsLoggedIn() {
	return typeof(ObjWdsForm.LG_login) != "undefined" && ObjWdsForm.LG_login.value.length > 0;
}

//allows a textbox to react to Enter or Escape keys 
function OnKeyPressHandler(i_clEvent, i_fnHandler, i_fnCancel) {
	var key = PWdsapp_bIsIE?i_clEvent.keyCode:i_clEvent.which;

	//Enter key?
	if (key == 13) {
		if (typeof(i_fnHandler) != "undefined") {
			i_fnHandler();
			return;
		}
	}

	//Escape key?
	if (key == 27) {
		if (typeof(i_fnCancel) != "undefined") {
			i_fnCancel();
		}
	}
}

//return NaN if the string is not a floating point number 
function getNumber(strValue) {
	
	if(strValue == "")
		return NaN;
	
	var bFoundDecimalSeparator = false; 	
	for (var i = 0; i < strValue.length; i++) {
		var cChar = strValue.charAt(i);
		if((cChar < '0' || cChar > '9') && cChar != '.' && cChar != ',' && cChar != "-")
			return NaN;

		if(cChar == '.' || cChar == ',') {
			if(bFoundDecimalSeparator)
				return NaN; //accept only one dot or one comma, no other separators
			else	
				bFoundDecimalSeparator = true;
		}		

		if(cChar == '-' && i > 0) {
			return NaN; //no subtract operations allowed
		}
	}
	strValue = strValue.replace(",",".");//commas are accepted as decimal points, to support French
	return parseFloat(strValue);
}

//in FireFox (and maybe others too), disabled img tags still send onClick events
function IsDisabled(i_strControlId) { 
	var objCtrl = document.getElementById(i_strControlId);
	return objCtrl.disabled;
}

function IsPositiveInteger(strString)
{
	var strValidChars = "0123456789";
	var strChar;
	var bNonZeroFound=false;
	var i;
	if (strString.length == 0) return false;

	for (i = 0; i < strString.length; i++)
	{
		strChar = strString.charAt(i);
		if (strValidChars.indexOf(strChar) == -1)
			return false;
		if(strChar!="0") bNonZeroFound=true;
	}

	return bNonZeroFound;
}

function GetUiLanguage(i_strLang) {
	switch (i_strLang) {
	case "en": return "eng";
	case "fr": return "fra";
	case "de": return "deu";
	case "da": return "dan";
	case "nl": return "nld";
	case "es": return "esn";
	case "fi": return "fin";
	case "is": return "isl";
	case "it": return "ita";
	case "no": return "nor";
	case "pt": return "ptg";
	case "sv": return "sve";
	return "eng";
	}
}
