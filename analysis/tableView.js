// WDS 8.2.10000

var G_ulCellNoLimit = 15000;
var G_ulExcelColumnsLimit = 255;
var G_ulExcelRowsLimit = 16384;
var G_strTableView = "tableView.aspx";
var G_WD_Printable;
var G_IF_ReportType;
var G_ScrollBar = false;

function GetDefaultView() {
	var objGroupsModified = document.getElementById("WD_GroupsModified");
	if (objGroupsModified != null){
		var strValue = objGroupsModified.value;
		if (strValue == "True"){
			if (!confirm(resCG_GroupsModified)) {
				return;
			}
		}
	}

	CreateHiddenFormField(ObjWdsForm, "WD_GetDefaultView", "True");
	ObjWdsForm.action = G_strTableView;
	executeWait(ObjWdsForm);
}

function OnPreparePrint(i_object) {
	if (ObjWdsForm.sCS_DownloadLimit.value != "0") {
		G_ulCellNoLimit = ObjWdsForm.sCS_DownloadLimit.value;	
	}
	var ulRowCount = parseInt(ObjWdsForm.sWD_RowsItemsCount.value);
	var ulColCount = parseInt(ObjWdsForm.sWD_ColsItemsCount.value);
	var ulCellCount = ulRowCount * ulColCount;
	if (ulCellCount > G_ulCellNoLimit) {
		alert(ulCellCount.toString() + resCellNoLimitReached + " " + G_ulCellNoLimit.toString() + resCellNoLimitTryAgain);
		return;
	}

	var bIsSpawnWindow = IsSpawnWindow();
	if (bIsSpawnWindow) {
		GetFormFields();
	}

	CreateHiddenFormField(ObjWdsForm, "WD_Printable", "1");
	CreateHiddenFormField(ObjWdsForm, "IF_ReportType", REPORT_TYPE_TABLE);
	ObjWdsForm.action = G_strTableView;
	if (bIsSpawnWindow) {
		GenerateNewWindow("_WdsTable", "/TableViewer/tableView.aspx");
	}
	else {
		onLocalPageUnload = function() { CreateHiddenFormField(ObjWdsForm, "WD_Printable", "0"); }
		executeWait(ObjWdsForm);
	}

	if (bIsSpawnWindow) {
		SetFormFields();
	}
}

function GetFormFields() {
	if (typeof(ObjWdsForm.WD_Printable) != "undefined") {
		G_WD_Printable = ObjWdsForm.WD_Printable.value;
	}
	if (typeof(ObjWdsForm.IF_ReportType) != "undefined") {
		G_IF_ReportType = ObjWdsForm.IF_ReportType.value;
	}	
}

function SetFormFields() {
	if (typeof(ObjWdsForm.WD_Printable) != "undefined") {
		ObjWdsForm.WD_Printable.value = G_WD_Printable;
	}
	if (typeof(ObjWdsForm.IF_ReportType) != "undefined") {
		ObjWdsForm.IF_ReportType.value = G_IF_ReportType;
	}	
}

function OnSelectChildren(i_nDim, i_strMemberPosition) {
	CreateHiddenFormField(ObjWdsForm, "WD_Command", "SelectChildren");
	CreateHiddenFormField(ObjWdsForm, "WD_SelectMembersDim", i_nDim);
	CreateHiddenFormField(ObjWdsForm, "WD_SelectParent", i_strMemberPosition);
	ObjWdsForm.action = G_strTableView;
	executeWait(ObjWdsForm);
}

function onCalcTotalPercent(i_nType) {
	CreateHiddenFormField(ObjWdsForm, "WD_Command", "SetTotalPercent");
	CreateHiddenFormField(ObjWdsForm, "WD_TotalPercent", i_nType);
	ObjWdsForm.action = G_strTableView;
	executeWait(ObjWdsForm);
}

function onPageLoad() {
	var unRowCount;
	var unColCount;

	onPageLoadGlobal();
	if (ObjWdsForm.CS_InHelp != null && ObjWdsForm.CS_InHelp.value == "True") {
		onLayoutResize(true);
		return;
	}

	
	var clJsdnd = new GJsdnd();
	clJsdnd.Initialize(this, false);

	unRowCount = parseInt(ObjWdsForm.sWD_RowsItemsCount.value);
	unColCount = parseInt(ObjWdsForm.sWD_ColsItemsCount.value);
	newTable(unRowCount, unColCount);

	if (ObjWdsForm.sWD_SourceInfo != null) {
		// If we set window.status at load time, it is not guaranteed to work.
		// By using the setTimeout() function, this page can finish loading before the status is set
		var strStatus = "window.status = unescape('" + ObjWdsForm.sWD_SourceInfo.value + "');";
		setTimeout(strStatus, 1);
	}
	onLayoutResize(true);

	if (!PWdsapp_bIsIE) {
		document.body.addEventListener('DOMMouseScroll', onMouseWheelScrolling, false);
	}

	if(ObjWdsForm.WD_RepairFlag != null) {
		RemoveFormField(ObjWdsForm, "WD_RepairFlag");//so we don't warn again
		alert(resReportFlaggedDuringRepairIVT);
	}

	var objTitleHF = document.getElementById("CS_ReportTitle");
	if(objTitleHF != null && objTitleHF.value != "")
		document.title = resWDS + " - " + resTableViewTitle + " - " + objTitleHF.value;

	(function($) {
		$('body').on("keydown", onKeyDownScrolling);
		$.widget("my.ajaxmenu", $.ui.menu, {
			_handlers: {},
			_create: function(event, ui) {
				var that = this;
				that._handlers.setCursor = $.proxy(function(e) {
					e.delta = null;
					var o = e.originalEvent;
					if (o) {
						if (o.wheelDelta) e.delta = o.wheelDelta / -40;
						if (o.deltaY) e.delta = o.deltaY;
						if (o.detail) e.delta = o.detail;
						if (e.delta) {
							e.preventDefault();
							var step = that.scrollbar.slider("option", "step");
							var currValue = that.scrollbar.slider("value");
							step *= e.delta < 0 ? 1 : -1;
							that.scrollbar.slider("value", currValue + step);
						}
					}
					return false;
				}, that);
				that._handlers.stopMyEvent = $.proxy(function(e) {
					e.stopPropagation();
				}, that);
				that._handlers.sbMouseDown = $.proxy(function(e) {
					G_ScrollBar = true;
				}, that);
				that._handlers.sbMouseUp = $.proxy(function(e) {
					G_ScrollBar = false;
				}, that);
				that.busy = false;
				that.dim = that.options.dim;
				that.rowCount = -1;
				that.getItems = that.options.getItems;

				that.bufferTop = 0;
				that.cursorTop = 0;
				that.bufferCount = 0;
				that.cursorCount = 10;
				that.bufferMax = 100;
				that.rowCount = that.options.getItemCount(that.dim);
				that.buffer = [];
				that.maxValue = Math.max(0, that.rowCount);
				that.scrollbar = $("#" + that.options.scrollbarId).slider(
					{
						orientation: "vertical",
						min: that.cursorCount,
						max: that.maxValue,
						step: 1,
						value: that.maxValue,
						change: function(event, ui) {
							$(this).closest(".MenuTableClass").find(".MenuTestClass").ajaxmenu("setCursorPosition", ui.value);
						}
					}
				);
				that.scrollbar.on("mousedown", $.proxy(that._handlers.sbMouseDown, that));
				that.scrollbar.on("mouseup", $.proxy(that._handlers.sbMouseUp, that));
				that.scrollbar.on("click", $.proxy(that._handlers.stopMyEvent, that));
				that.scrollbar.on('mousewheel DOMMouseScroll', $.proxy(that._handlers.setCursor, that));
				that.element.on('mousewheel DOMMouseScroll', $.proxy(that._handlers.setCursor, that));
				// that.element.bind('menukeydown', $.proxy(that._handlers.checkKeydown, that));
				// that.element.on('keydown', $.proxy(that._handlers.checkKeydown, that));
				if (that.rowCount <= that.cursorCount) {
					that.scrollbar.hide();
				}
				that.redrawMenu = function(elem) {
					var offset = that.cursorTop - that.bufferTop;
					var bufferRows = Math.min(that.cursorCount, that.buffer.length - offset);
					var currentMenuItems = that.buffer.slice(offset, offset + bufferRows);
					var myActiveMenu = that.element;
					var dim = that.dim.toString();
					var index = 0;
					if (that.rowCount <= that.cursorCount) {
						that.element.removeClass("MenuTestFixedClass");
					}
					else {
						that.element.addClass("MenuTestFixedClass");
					}
					$.each(currentMenuItems, function(key, value) {
						var anchor;
						var liid = "li-el-d" + dim + "-mi" + index;
						var xli = myActiveMenu.find("#" + liid);
						if (xli.length == 0) {
							var li = $('<li/>').appendTo(myActiveMenu);
							li.attr("id", liid);
							anchor = $("<a/>");
							var aid = "a-el-d" + dim + "-mi" + index;
							anchor.attr("id", aid);
							anchor.attr("href", "javascript:selectItem(" + dim + ", " + value.pos.toString() + ");");
							if (value.label.length > 20) {
								anchor.attr("title", value.label);
								anchor.attr("alt", value.label);
							}
							else {
								anchor.attr("title", "");
								anchor.attr("alt", "");
							}
							anchor.text(value.label)
							anchor.appendTo(li);
						}
						else {
							anchor = xli.find("a");
							anchor.text(value.label);
							anchor.attr("href", "javascript:selectItem(" + dim + ", " + value.pos.toString() + ");");
							if (value.label.length > 20) {
								anchor.attr("title", value.label);
								anchor.attr("alt", value.label);
							}
							else {
								anchor.attr("title", "");
								anchor.attr("alt", "");
							}
						}
						index++;
					});
					this.refresh();
				};

				that.updateMenu = function(elem) {
					var menu = that;
					var dim = that.dim;
					if (that.cursorTop >= that.bufferTop && (that.cursorTop + that.cursorCount) <= (that.bufferTop + that.bufferCount)) {
						// We can redraw based on the buffer
						menu.redrawMenu(elem);
					}
					else {
						// We need to retrieve a new set of items into the buffer.
						var top = Math.max(0, that.cursorTop - Math.round((that.bufferMax - that.cursorCount) / 2));
						var topRow = Math.min(that.rowCount, top + that.bufferMax);
						that.busy = true;
						that.getItems(dim, top, topRow,
							function(data, top, topRow) {
								menu.busy = false;
								menu.buffer = data;
								menu.bufferTop = top;
								menu.bufferCount = topRow - top;
								menu.redrawMenu(elem);
							}
						);
					}
				};
				that.setCursorPosition = function(row) {
					that.cursorTop = that.rowCount - row;
					that.updateMenu();
				};
				that.element.empty();
				that.updateMenu();
				that._super();
			},
			_keydown: function(event) {
				if (!this.busy) {
					var preventDefault = false;
					if (event.keyCode == 40) {
						// Down arrow
						if ($(event.target).ajaxmenu('isLastItem')) {
							preventDefault = true;
							if (this.cursorTop < Math.max(0, this.rowCount - this.cursorCount)) {
								var focused = $(event.target).find("li:has(a.ui-state-focus)");
								var focusId = focused.find("a")[0].id;
								this.cursorTop++;
								this.scrollbar.slider("value", this.rowCount - this.cursorTop);
							}
						}
						event.stopPropagation();
					}
					else if (event.keyCode == 38) {
						// Up arrow
						if ($(event.target).ajaxmenu('isFirstItem')) {
							preventDefault = true;
							if (this.cursorTop > 0) {
								var focused = $(event.target).find("li:has(a.ui-state-focus)");
								var focusId = focused.find("a")[0].id;
								this.cursorTop--;
								this.scrollbar.slider("value", this.rowCount - this.cursorTop);
							}
						}
						event.stopPropagation();
					}
					else if (event.keyCode == 33) {
						// Page up
						var focused;
						preventDefault = true;
						if (this.cursorTop >= 0) {
							if (this.cursorTop < this.cursorCount) {
								focused = $(event.target).find("li:first-child");
							}
							else {
								focused = $(event.target).find("li:has(a.ui-state-focus)");
							}
							var focusId = focused.find("a")[0].id;
							this.cursorTop = Math.max(0, this.cursorTop - this.cursorCount);
							this.scrollbar.slider("value", this.rowCount - this.cursorTop);
						}
						event.stopPropagation();
					}
					else if (event.keyCode == 34) {
						// Page down
						preventDefault = true;
						if ((this.cursorTop + this.cursorCount) < this.rowCount) {
							var focused = $(event.target).find("li:has(a.ui-state-focus)");
							var focusId = focused.find("a")[0].id;
							this.cursorTop = Math.min(this.cursorTop + this.cursorCount, this.rowCount - this.cursorCount);
							this.scrollbar.slider("value", this.rowCount - this.cursorTop);
						}
						event.stopPropagation();
					}
					else if (event.keyCode == 13 || event.keyCode == 32) {
						// Return or space bar
						var focused = $(event.target).find("li:has(a.ui-state-focus)");
						if (focused) {
							var focusa = focused.find("a")[0];
							if (focusa) focusa.click();
						}
					}
					else if (event.keyCode == 27) {
						// FIXME: Doesn't work when you first open it, only if you move into the box.
						$(event.target).closest(".MenuTableClass").hide();
						event.stopPropagation();
					}
					// escape = 27
					// page up = 33
					// page down = 34
					// home = 36
					// end = 35
					if (preventDefault) {
						event.preventDefault();
					}
					else {
						this._super(event);
					}
				}
			}
		});

		function getMenuItems(dim, start, end, notifier) {
			var count = Math.max(0, 1 + (end - start));
			var clRequest = new wdsRequest();
			clRequest.Lang = $("sCS_ChosenLang").val();
			clRequest.Handler = function(i_oResult, i_clUserData) {
				if (i_oResult.status) {
					notifier(i_oResult.items, start, end);
				}
				else {
					alert(i_oResult.message);
				}
			};
			var form = document.getElementById("WdsForm");
			clRequest.m_strURL = "../wdsAPI.aspx";
			clRequest.ExecGetItems(dim, start, count, form);
		};
		function createSelectorMenu(dim) {
			var d = dim.toString();
			$("#menutest" + d).ajaxmenu({
				scrollbarId: ("slider" + d),
				dim: ObjWdsForm.sWD_Others.value.split(",")[dim],
				getItemCount: function(dim) {
					var nItems = ObjWdsForm.sWD_SelectedItemsCount.value.split(",")[dim];
					return parseInt(nItems);
				},
				getItems: getMenuItems
			});
			$("#menutable" + d).hide();
		}
		var otherDims = ObjWdsForm.sWD_Others.value.split(",");
		for (var od in otherDims) {
			createSelectorMenu(od);
		}
	})(jQuery);

}

function onPageUnload() {
	if (typeof(ObjWdsForm.WD_Printable) != "undefined") {
		CreateHiddenFormField(ObjWdsForm, "WD_Printable", "0");
	}
}

function CheckExcelLimits() {
	var astrColsDims;
	var astrOthersDims;
	var astrRowDims;
	var bIsLimitsChecked = true;
	var ulColDimsCount = 0;
	var ulColItemsCount = 0;
	var ulOtherDim = 0;
	var ulRowDimsCount = 0;
	var ulRowItemsCount = 0;

	if (ObjWdsForm.sWD_Others.value != "") {
		astrOthersDims = ObjWdsForm.sWD_Others.value.split(",");
		// Other dims are placed on one line.
		if (astrOthersDims.length > 0) {
			ulOtherDim = 1;
		}
	}
	if (ObjWdsForm.sWD_Rows.value != "") {
		astrRowDims = ObjWdsForm.sWD_Rows.value.split(",");
		ulRowDimsCount = astrRowDims.length;
	}
	if (ObjWdsForm.sWD_Cols.value != "") {
		astrColDims = ObjWdsForm.sWD_Cols.value.split(",");
		ulColDimsCount = astrColDims.length;
	}
	ulRowItemsCount = parseInt(ObjWdsForm.sWD_RowsItemsCount.value);
	ulColItemsCount = parseInt(ObjWdsForm.sWD_ColsItemsCount.value);
	
	if ((ulColItemsCount + ulRowDimsCount) > G_ulExcelColumnsLimit) {
		alert(resExcelColumnsLimit);
		bIsLimitsChecked = false;
	}
	// + 3: the report title is placed on one row + followed by a blank row + row dims are placed on one line.
	if ((ulColDimsCount + ulOtherDim + ulRowItemsCount + 3) > G_ulExcelRowsLimit) {
		alert(resExcelRowsLimit);
		bIsLimitsChecked = false;
	}
	
	return bIsLimitsChecked;
}

function onDownload(i_nType) {
	HideMenu("MenuCell_Download");

	var strTypes = new Array('IVT', 'XLS', 'CSV', 'SSV', 'PDF');
	var strType;
	var ulCellCount;
	var ulRowItemsCount;
	var ulColItemsCount;
	var ulSelectedItemCount;

	strType = strTypes[i_nType];

	if (typeof(ObjWdsForm.sCS_DownloadLimit) != "undefined") {
		G_ulCellNoLimit = ObjWdsForm.sCS_DownloadLimit.value;	
	}
	
	if (strType == "IVT") {
		ulCellCount = 1;
		var astrSelectedItemsCount = ObjWdsForm.sWD_SelectedItemsCount.value.split(",");
		for (var i = 0; i < ObjWdsForm.sWD_MaxDim.value; i++) {
			ulSelectedItemCount = astrSelectedItemsCount[i];
			ulCellCount *= ulSelectedItemCount;
		}
	}
	else {
		ulRowItemsCount = parseInt(ObjWdsForm.sWD_RowsItemsCount.value);
		ulColItemsCount = parseInt(ObjWdsForm.sWD_ColsItemsCount.value);
		ulCellCount = ulRowItemsCount * ulColItemsCount;
	}
	
	if (ulCellCount > G_ulCellNoLimit) {
		alert(ulCellCount.toString() + resCellNoLimitReached + " " + G_ulCellNoLimit.toString() + resCellNoLimitTryAgain);
	}
	else {
		// Currently we limit the number of cells to 15000, if we choose to increase this number,
		// we have to consider the limit on maximum number of rows in Excel 95 which is 16384.
		var bIsLimitsChecked = true;
		if (strType == "XLS") {
			bIsLimitsChecked = CheckExcelLimits();
		}
		if (bIsLimitsChecked) {
			if (IsSpawnWindow()) {
				var oForm = ObjWdsForm;
				CreateHiddenFormField(oForm, "WD_DownloadFormat", strType);
				CreateHiddenFormField(oForm, "sCS_SpawnWindow", "True"); 
				
				var strDownloadPromptPage = "_downloadPrompt";
				var strDownloadPromptPath = "/TableViewer/downloadPrompt.aspx";
				GenerateNewWindow(strDownloadPromptPage, strDownloadPromptPath);
			}
			else {
				var strPreviousPage = ObjWdsForm.action;
				CreateHiddenFormField(ObjWdsForm, "WD_DownloadFormat", strType);
				CreateHiddenFormField(ObjWdsForm, "WD_PageBeforeSummary", document.location.pathname);
				ObjWdsForm.action = "downloadPrompt.aspx";
				ObjWdsForm.submit();
			} 
		}
	}
}

function OnPreviousItem(i_nDim) {
	CreateHiddenFormField(ObjWdsForm, "WD_Command", "PreviousMember");
	CreateHiddenFormField(ObjWdsForm, "WD_PreviousItemForDim", i_nDim);
	ObjWdsForm.action = G_strTableView;
	executeWait(ObjWdsForm);
}

function OnNextItem(i_nDim) {	
	CreateHiddenFormField(ObjWdsForm, "WD_Command", "NextMember");
	CreateHiddenFormField(ObjWdsForm, "WD_NextItemForDim", i_nDim);
	ObjWdsForm.action = G_strTableView;
	executeWait(ObjWdsForm);
}

function CloseAllMenus() {
	$(".MenuTableClass").hide();
}

function selectItem(dim, pos) {
	CloseAllMenus();
	CreateHiddenFormField(ObjWdsForm, "WD_Command", "SelectOtherItem");
	CreateHiddenFormField(ObjWdsForm, "WD_SelectMembersDim", dim);
	CreateHiddenFormField(ObjWdsForm, "WD_SelectMember", pos);
	ObjWdsForm.action = G_strTableView;
	executeWait(ObjWdsForm);
}

function onLocalObjectClick(event) {
	onObjectClick();
	var className = $(event.srcElement || event.originalTarget).attr('class');
	if (className != "selectMenuClass") {
		if (G_ScrollBar) {
			G_ScrollBar = false;
		}
		else {
			CloseAllMenus();
		}
	}
	return false;
}

function onClickSelectOther(dim) {
	var d = dim.toString();
	var bVis = $("#menutable" + d).is(":visible");
	CloseAllMenus();
	if (!bVis) $("#menutable" + d).show(200);
}
