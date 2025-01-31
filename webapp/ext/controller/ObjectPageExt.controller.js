sap.ui.define([
	"sap/ui/core/mvc/ControllerExtension",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/ListItem",
	"sap/ui/model/Sorter",
	"sap/m/BusyDialog",
	"sap/ui/comp/state/UIState",
	"xlsx"

], function (ControllerExtension, JSONModel, Fragment, ODataModel, Filter, FilterOperator, ListItem, Sorter, BusyDialog, UIState, XLSX) {
	"use strict";

	return sap.ui.controller("CGDC.CIS-AD-Pricing-Maintenance.ext.controller.ObjectPageExt", {
			onInit: function () {
				let that = this;
				this.extensionAPI.attachPageDataLoaded(function (oEvent) {
					{
						that.object = that.extractParameters(oEvent.context.getDeepPath());
						that.additionalData = oEvent.context.getProperty('AddDataVis');
						if (that.object) {
							if (that.object.Kotab) {
								that.aTable = that.object.Kotab;
								that.Kschl = that.object.Kschl;

							}
							if (that.object.kotab) {
								that.aTable = that.object.kotab;
								that.Kschl = that.object.kschl;

							}
							that.setTableColumnData(that.aTable, that.Kschl);
							let edit = sap.ui.getCore().byId(
								"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--edit");
							if (edit) {
								edit.attachPress(that.editPress, that);
							}

						}
					}
				});
			},
			editPress: function () {
				if (sap.ui.getCore().byId(
						"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--Home::Form")) {
					let createForm = sap.ui.getCore().byId(
						"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--Home::Form");
					let aAllSmartfield = createForm.getSmartFields();
					for (let i = 0; i < aAllSmartfield.length; i++) {
						if (aAllSmartfield[i].getDataProperty().property.name == 'vbelnentry') {
							if (aAllSmartfield[6].getValue() == "") {
								aAllSmartfield[6].setEditable(true);
							} else {
								aAllSmartfield[6].setEditable(false);
							}
						}
					}
				}

			},
			extractParameters: function (inputString) {
				// Regular expression to match the parameters in the form of Key='Value'
				const regex = /(\w+)=\'([^\']*)\'/g;
				const parameters = {};
				let match;

				// Iterate over all matches and store them in an object
				while ((match = regex.exec(inputString)) !== null) {
					parameters[match[1]] = match[2];
				}

				return parameters;
			},
			extractTerms: function (inputString) {
				// Define a regular expression to capture terms after '--ItemDetails::Table-'
				const regex = /--ItemDetails::Table-([a-zA-Z0-9_]+)/g;

				// Initialize an array to hold the matched terms
				let matches = [];
				let match;

				// Use the regex to find all matches in the string
				while ((match = regex.exec(inputString)) !== null) {
					matches.push(match[1]); // match[1] contains the captured term
				}

				// Return the array of matched terms
				return matches;
			},

			setTableColumnData: function (Kotab, Kschl, Vbeln, mganr) {
				let that = this;
				if (this.getView().getBindingContext()) {
					let oModel = this.getView().getModel();
					let filters = [];
					let oPath = '/xcgdcxi_pricing_t_key';
					filters.push(new sap.ui.model.Filter("TABNAME", sap.ui.model.FilterOperator.EQ, Kotab));
					filters.push(new sap.ui.model.Filter("KSCHL", sap.ui.model.FilterOperator.EQ, Kschl));
					//	filters.push(new sap.ui.model.Filter("VBELN", sap.ui.model.FilterOperator.EQ, Vbeln));
					//		filters.push(new sap.ui.model.Filter("MGANR", sap.ui.model.FilterOperator.EQ, mganr));
					oModel.read(oPath, {
							filters: filters,
							success: function (oData) {
								let tableColumn = oData.results;
								that.getOwnerComponent().getModel("CustomFields").setData(tableColumn);
								if (sap.ui.getCore().byId(
										"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--Home::Form")) {
									let createForm = sap.ui.getCore().byId(
										"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--Home::Form");
									let allVisiblieFields = createForm.getVisibleProperties();
									let oRequiredFields = that.getOwnerComponent().getModel("CustomFields").getData();
									let aRequiredFields = [];
									let sInitiallyVisibleFields = Object.keys(oRequiredFields).map(function (k) {
										aRequiredFields.push(oRequiredFields[k].FIELDNAME.toLowerCase());
										return oRequiredFields[k].FIELDNAME.toLowerCase()
									}).join(",");
									let aDeactivateFields = that.removeElements(allVisiblieFields, aRequiredFields);
									let aAllSmartfield = createForm.getSmartFields();
									for (let i = 0; i < aAllSmartfield.length; i++) {
										aAllSmartfield[i].setVisible(false);
										for (let j = 0; j < aRequiredFields.length; j++) {
											if (aAllSmartfield[i].getDataProperty().property.name == aRequiredFields[j]) {
												aAllSmartfield[i].setVisible(true);
												break;
											}

										}

									}
								}

								//	that.getView().getModel().refresh(true);

								if (sap.ui.getCore().byId(
										"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--Price::Form")) {
									let oPriceForm = sap.ui.getCore().byId(
										"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--Price::Form");
									let allVisiblieFields = oPriceForm.getVisibleProperties();
									let oRequiredFields = that.getOwnerComponent().getModel("CustomFields").getData();
									let aRequiredFields = [];
									let sInitiallyVisibleFields = Object.keys(oRequiredFields).map(function (k) {
										aRequiredFields.push(oRequiredFields[k].FIELDNAME.toLowerCase());
										return oRequiredFields[k].FIELDNAME.toLowerCase()
									}).join(",");
									let aDeactivateFields = that.removeElements(allVisiblieFields, aRequiredFields);
									let aAllSmartfield = oPriceForm.getSmartFields();
									for (let i = 0; i < aAllSmartfield.length; i++) {
										aAllSmartfield[i].setVisible(false);
										for (let j = 0; j < aRequiredFields.length; j++) {
											if (aAllSmartfield[i].getDataProperty().property.name == aRequiredFields[j]) {
												aAllSmartfield[i].setVisible(true);
												break;
											}
										}
									}

								}
								if (sap.ui.getCore().byId(
										"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--AddData::Form")) {
									let oAddDataForm = sap.ui.getCore().byId(
										"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--AddData::Form");
									let addSection = sap.ui.getCore().byId(
										"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--AddData::Section"
									);
									addSection.setVisible(true);
									if (that.additionalData === 'X') {
										addSection.setVisible(false);
									} else {
										let allVisiblieFields = oAddDataForm.getVisibleProperties();
										let oRequiredFields = that.getOwnerComponent().getModel("CustomFields").getData();
										let aRequiredFields = [];
										let sInitiallyVisibleFields = Object.keys(oRequiredFields).map(function (k) {
											aRequiredFields.push(oRequiredFields[k].FIELDNAME.toLowerCase());
											return oRequiredFields[k].FIELDNAME.toLowerCase()
										}).join(",");
										let aDeactivateFields = that.removeElements(allVisiblieFields, aRequiredFields);
										let aAllSmartfield = oAddDataForm.getSmartFields();
										for (let i = 0; i < aAllSmartfield.length; i++) {
											aAllSmartfield[i].setVisible(false);
											for (let j = 0; j < aRequiredFields.length; j++) {
												if( aAllSmartfield[i].getId().includes(aRequiredFields[j]) ) {
												aAllSmartfield[i].setVisible(true);
												break;
											}
										}
									}
								}
							}
							if (sap.ui.getCore().byId(
									"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::Table"
								)) {
								let smarttable = sap.ui.getCore().byId(
									"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::Table"
								);
								let responsivetable = sap.ui.getCore().byId(
									"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::responsiveTable"
								);
								let oColumns = responsivetable.getColumns();
								let aColumnId = that.extractTerms(oColumns.toString());
								let oCustomFieldsTable = that.getOwnerComponent().getModel("CustomFields").getData();
								let aRequiredColumns = [];
								let sInitiallyVisibleFields = Object.keys(oCustomFieldsTable).map(function (k) {
									aRequiredColumns.push(oCustomFieldsTable[k].FIELDNAME.toLowerCase());
									return oCustomFieldsTable[k].FIELDNAME.toLowerCase()
								}).join(",");
								let aDeactivateColumns = that.removeElements(aColumnId, aRequiredColumns);
								smarttable.deactivateColumns(aDeactivateColumns);
								//	that.getView().getModel().refresh(true);
							}
						},
						error: function (oError) {}
					});
			}
		},
		onUploadCancelButton : function(oEvent){
			this.oUploadDialog.close();
		},
		handleUploadComplete : function(oEvent){
			this.excelSheetsData = [];
			var oFileUploader = sap.ui.core.Fragment.byId("idFragUploadDialog", "fileUploader");
			var oFile = oEvent.getSource().FUEl.files[0]
			var reader = new FileReader();
			var that = this;
	
			reader.onload = (e) => {
				
				// getting the binary excel file content
				let xlsx_content = e.currentTarget.result;
	
				let workbook = XLSX.read(xlsx_content, { type: 'binary' });
				// here reading only the excel file sheet- Sheet1
				var excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets["Sheet1"]);
				
				workbook.SheetNames.forEach(function (sheetName) {
					// appending the excel file data to the global variable
					that.excelSheetsData.push(XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]));
				});
				console.log("Excel Data", excelData);
			//	console.log("Excel Sheets Data", this.excelSheetsData);
			that.backendCall(excelData);
			};
			reader.readAsBinaryString(oFile);
		},
		onSUploadOkButton : function(oEvent){
			
			var that = this;
			
			this.excelSheetsData = [];
			var oFileUploader = sap.ui.core.Fragment.byId("idFragUploadDialog", "fileUploader");
			var oFile = oFileUploader.FUEl.files[0]
			if(!oFile){
				sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("selectFile"));
				return;
			}
			var reader = new FileReader();
			var that = this;
	
			reader.onload = (e) => {
				
				// getting the binary excel file content
				let xlsx_content = e.currentTarget.result;
	
				let workbook = XLSX.read(xlsx_content, { type: 'binary' });
				Object.keys(workbook.Sheets.Sheet1).map(function (k) {
					if(workbook.Sheets.Sheet1[k].w && workbook.Sheets.Sheet1[k].w.split("/").length > 1){
						workbook.Sheets.Sheet1[k].v = new Date(workbook.Sheets.Sheet1[k].w); //new Date(workbook.Sheets.Sheet1[k].w.split("/")[1] +'-'+ workbook.Sheets.Sheet1[k].w.split("/")[0] +'-'+ workbook.Sheets.Sheet1[k].w.split("/")[2]);
					}
				})
				// here reading only the excel file sheet- Sheet1
				var excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets["Sheet1"]);
				
				workbook.SheetNames.forEach(function (sheetName) {
					// appending the excel file data to the global variable
					that.excelSheetsData.push(XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]));
				});
				console.log("Excel Data", excelData);
			//	console.log("Excel Sheets Data", this.excelSheetsData);
			that.backendCall(excelData);
			};
			reader.readAsBinaryString(oFile);
		},
		backendCall : function(data){
			var data = this.excelSheetsData[0];
			var oData = this.getOwnerComponent().getModel("CustomFields").getData();
			var iExcelKeys = Object.keys(data[0]).length;
			var iOdataKeys = oData.length;
			// if(iExcelKeys !== iOdataKeys){
			// 	sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("columnsdiff"));
			// 	return;
			// }
			var that = this;
			var fnAddMessage = function () {
                return new Promise((fnResolve, fnReject) => {
                    that.callOdata(fnResolve, fnReject);
                });
            };
			this.extensionAPI.securedExecution(fnAddMessage);
		},
		callOdata : function(fnResolve, fnReject){
			let smarttable = sap.ui.getCore().byId(
				"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::Table"
			);
			var data = this.excelSheetsData[0];
			var oData = this.getOwnerComponent().getModel("CustomFields").getData();
			var oModel = this.getOwnerComponent().getModel();
			var aFianlArray = [],that = this;
			var sPath = this.getView().getBindingContext().sPath + "/toCncMain";
			data.forEach(function(value,index){
				var oObject = {};
				oData.forEach((oColumn,iIndex)=>{
					oColumn.FIELDNAME = oColumn.FIELDNAME.toLowerCase();
					//find it's data type
					var oFieldsEntityType = oModel.getServiceMetadata().dataServices.schema[0].entityType.find(x => x.name === 'xCGDCxI_CNC_MAINType');
					var oField = oFieldsEntityType.property.find((field,fieldIndex)=>{
						if(field.name === oColumn.FIELDNAME){
						return field;
						}
					})
					if(value[oColumn.FIELDNAME] !== undefined && value[oColumn.FIELDNAME] !== ''){
					if(oField.type === "Edm.DateTime"){
						if(isNaN(new Date(value[oColumn.FIELDNAME]).getTime())){
							if(value[oColumn.FIELDNAME].split(".").length > 1 ){
							oObject[oColumn.FIELDNAME] = new Date(value[oColumn.FIELDNAME].split(".")[1] +'-'+ value[oColumn.FIELDNAME].split(".")[0] +'-'+ value[oColumn.FIELDNAME].split(".")[2]);
							}else{
							oObject[oColumn.FIELDNAME] = new Date(value[oColumn.FIELDNAME]);
							}
						}else{
						oObject[oColumn.FIELDNAME] = new Date(value[oColumn.FIELDNAME]);
						}
					}else if(oField.type === "Edm.Boolean"){
						oObject[oColumn.FIELDNAME] = value[oColumn.FIELDNAME];
					}else if(oField.type !== "Edm.DateTime" && oField.type !== "Edm.Boolean"){
						oObject[oColumn.FIELDNAME] = value[oColumn.FIELDNAME].toString();
					}else{
						oObject[oColumn.FIELDNAME] = value[oColumn.FIELDNAME].toString();
					}
					}
					// if(value[oColumn.FIELDNAME]){
					// if(oColumn.DataType === "DATS"){
					// 	oObject[oColumn.FIELDNAME] = new Date(value[oColumn.FIELDNAME]);
					// }else{
					// 	oObject[oColumn.FIELDNAME] = value[oColumn.FIELDNAME].toString();
					// }
					// }
				});
				aFianlArray.push(oObject);
				//make the post call
				//xCGDCxI_CONDITON_CATALOG(Pmprf='ASL',Kschl='ZCC3',Kotab='A828',Vbeln='',mganr='',cc_docno='',Subct='S1',Counter=0)/toCncMain

				if(Object.keys(oObject).length !== 0){
				oModel.create(sPath, oObject, {
                    success: (result) => {
                        console.log(result);
						that.oUploadDialog.close();
						oModel.refresh();
						smarttable.rebindTable();
					//	sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("condrecordssaved"));
                       fnResolve();
                    },
                    error: (oError)=>{
						console.log(oError);
						fnReject();		
					}
                });
				}
			})			
		},
		onExcelUpload : function(oEvent){
			let responsivetable = sap.ui.getCore().byId(
				"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::responsiveTable"
			);
			// if (responsivetable.getItems().length === 0) {
			// 	sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("downloadTemplate"));
			// 	return;
			// }
			if (!this.oUploadDialog) {
				this.oUploadDialog = sap.ui.xmlfragment("idFragUploadDialog",
					"CGDC.CIS-AD-Pricing-Maintenance.ext.fragments.UploadDialog", this);
				this.getView().addDependent(this.oUploadDialog);
			}
			this.oUploadDialog.open();
			var oFileUploader = sap.ui.core.Fragment.byId("idFragUploadDialog", "fileUploader");
			oFileUploader.clear();
		},
		onImportToExcel : function(oEvent){
			let responsivetable = sap.ui.getCore().byId(
				"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::responsiveTable"
			);
			// if (responsivetable.getSelectedItem()) {
				var oSelectedObject = responsivetable.getSelectedItem() ? responsivetable.getSelectedItem().getBindingContext().getObject() : undefined;
				let aColumns = this.getOwnerComponent().getModel("CustomFields").getData();
				  // get the odata model binded to this application
				  var oModel = this.getView().getModel();	  
				  var excelColumnList = [],aRequiredColumns=[];
				  var colList = {};
				  aColumns.forEach((value, index)=>{
					value.FIELDNAME = value.FIELDNAME.toLowerCase();
					if(value.DataType === "DATS"){
						var oFormat = sap.ui.core.format.DateFormat.getInstance({
						//	pattern: "MM-dd-yyyy",
							style: "medium",
							calendarType: sap.ui.core.CalendarType.Gregorian
						});
						colList[value.FIELDNAME] = oSelectedObject && oSelectedObject[value.FIELDNAME] ? oFormat.format(new Date(oSelectedObject[value.FIELDNAME])) : null;
					}else{
					colList[value.FIELDNAME] = oSelectedObject?oSelectedObject[value.FIELDNAME]:"";
					}
				  });
				  Object.keys(aColumns).map(function (k) {
					aRequiredColumns.push(aColumns[k].FIELDNAME.toLowerCase());
				}).join(",");
				//   // finding the property description corresponding to the property id
				//   propertyList.forEach((value, index) => {
				// 	  let property = oBuilding.property.find(x => x.name === value);
				// 	  colList[property.extensions.find(x => x.name === 'label').value] = '';
				//   });
				   excelColumnList.push(colList);
				  
				  // initialising the excel work sheet
				  const ws = XLSX.utils.json_to_sheet(excelColumnList);
				  // creating the new excel work book
				  const wb = XLSX.utils.book_new();
				  // set the file value
				  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
				  // download the created excel file
				  XLSX.writeFile(wb, 'Condition_Catalogs.xlsx');
	  
				  sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("tempdownload"));
			// }else{
			// 	sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("selectitem"));
			// }
		},
		removeElements: function (array, elementsToRemove) {
			// Create a Set from the elements to remove for efficient lookup
			const removalSet = new Set(elementsToRemove);

			// Filter the array to remove the elements that are in the removal set
			return array.filter(item => !removalSet.has(item));
		},
		onPressGrops : function(oEvent){
			let responsivetable = sap.ui.getCore().byId(
				"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::responsiveTable"
			);
			// if (responsivetable.getSelectedItem()) {
			if (!this.oGroupPopver) {
				this.oGroupPopver = sap.ui.xmlfragment("idFragGrppopover",
					"CGDC.CIS-AD-Pricing-Maintenance.ext.fragments.GroupPopOver", this);
				this.getView().addDependent(this.oGroupPopver);
			}
			this.oGroupPopver.openBy(oEvent.getSource());
		// }else{
		// 		sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("selectitem"));
		// 	}
		},
		onCreateGroupPress : function(GroupCode){
			var oItemsJson = new JSONModel({
				results: []
			});
			this.getView().setModel(oItemsJson, "Items");
			this.GroupCode = GroupCode;
			if (!this.oGroupDialog) {
				this.oGroupDialog = sap.ui.xmlfragment("idFragGrpDialog",
					"CGDC.CIS-AD-Pricing-Maintenance.ext.fragments.GroupDialog", this);
				this.getView().addDependent(this.oGroupDialog);
			}
			this.oGroupDialog.open();
			//this.oGroupDialog.setTitle(this.getView().getModel("i18n").getResourceBundle().getText("group"));
			var oSaveButton = sap.ui.core.Fragment.byId("idFragGrpDialog", "idsavebutton");
			if(GroupCode === 1){
				oSaveButton.setText(this.getView().getModel("i18n").getResourceBundle().getText("create"));
			this.oGroupDialog.setTitle(this.getView().getModel("i18n").getResourceBundle().getText("creategroup"));
			}else if(GroupCode === 2){
				oSaveButton.setText(this.getView().getModel("i18n").getResourceBundle().getText("save"));
				this.oGroupDialog.setTitle(this.getView().getModel("i18n").getResourceBundle().getText("maintgroup"));
			}
			//var sPath = "/CC_Group_Header(cc_grpid='')";
			let oSelectedItemContext = this.getOwnerComponent().getModel().createEntry("/CC_Group_Header", {
				properties: {
					cc_grpid: '',
					cc_desc: "",
					cc_stdt:null,
					cc_endt : null,
					cc_ernam :"",
					cc_erdat : null,
					cc_aenam : "",
					cc_aedat : null
				}
			});
			var oForm = sap.ui.core.Fragment.byId("idFragGrpDialog", "idmbismartform1");
			oForm.setBindingContext(oSelectedItemContext);
		},
		onGroupDialogClose : function(oEvent){
			this.oGroupDialog.close();
			var oModelContexts = oEvent.getSource().getModel().mContexts;
			this._performResetChanges(oModelContexts,"/CC_Group_Header");
		},
		onGroupDialogOkButton : function(oEvent){
			this.oGroupDialog.close();
			sap.m.MessageToast.show("Development is in Progress");
			var oModelContexts = oEvent.getSource().getModel().mContexts;
			this._performResetChanges(oModelContexts,"/CC_Group_Header");
		},
		_performResetChanges : function(oModelContexts,sPath){
			var oModel = this.getView().getModel();
		//    var oForm = sap.ui.core.Fragment.byId(fragid, formid);
			var aModelContexts = $.map(oModelContexts, function (value, index) {
				return [index];
			});
			for (var i = 0; i < aModelContexts.length; i++) {
				if (aModelContexts[i].toString().startsWith(sPath)) {
					oModel.resetChanges([aModelContexts[i]], undefined, true);
				}
			}
		},
		onAddRowSoItem: function (oEvent) {
			var oModel1 = this.getView().getModel("Items");
			var aArray = oModel1.getData().results;
			var sNum = aArray.length + 1;
			var oEntry = {
				key: Math.random(),
			//	FENUM: sNum.toString(),
				fieldname: "",
				operator: "",
				value: "",
				cc_set: "",
				NEWENTRY: "X"
			};
			aArray.push(oEntry);
			oModel1.setData({
				results: aArray
			});
			oModel1.refresh(true);
		},
		onDelRowSoItem: function (oEvent) {
			if (oEvent.getSource().getParent().getParent().getSelectedItem()) {
				var oModel = oEvent.getSource().getModel();
				var oItem = oEvent.getSource().getParent().getParent().getSelectedItem();
				var oModelObject = oEvent.getSource().getModel("Items").getObject(oItem.getBindingContextPath());
				if (!oModelObject.NEWENTRY) {
					sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("notnewentry"));
					return;
				}
				var oModel1 = this.getView().getModel("Items");
				var aArray = oModel1.getData().results;
				var bEntryFound = false,
					iIndex;
				aArray.forEach(function (entry, id) {
					if (entry.key === oModelObject.key) {
						bEntryFound = true;
						iIndex = id;
					}
				});
				if (bEntryFound) {
					aArray.splice(iIndex, 1);
					this.getView().getModel("Items").refresh(true);
				}
				var oTable = sap.ui.core.Fragment.byId("idFragGrpDialog", "RmaSoItemTable");
				oTable.removeSelections(true);
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("selectitem"));
			}
		},

	});
});