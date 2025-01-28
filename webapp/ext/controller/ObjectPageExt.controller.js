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
			var that = this;
			var fnAddMessage = function () {
                return new Promise((fnResolve, fnReject) => {
                    that.callOdata(fnResolve, fnReject);
                });
            };
			this.extensionAPI.securedExecution(fnAddMessage);
		},
		callOdata : function(fnResolve, fnReject){
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
						oObject[oColumn.FIELDNAME] = new Date(value[oColumn.FIELDNAME]);
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
				//make the post call
				//xCGDCxI_CONDITON_CATALOG(Pmprf='ASL',Kschl='ZCC3',Kotab='A828',Vbeln='',mganr='',cc_docno='',Subct='S1',Counter=0)/toCncMain

				if(Object.keys(oObject).length !== 0){
				oModel.create(sPath, oObject, {
                    success: (result) => {
                        console.log(result);
						that.oUploadDialog.close();
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
			if (responsivetable.getItems().length === 0) {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("downloadTemplate"));
				return;
			}
			if (!this.oUploadDialog) {
				this.oUploadDialog = sap.ui.xmlfragment("idFragUploadDialog",
					"CGDC.CIS-AD-Pricing-Maintenance.ext.fragments.UploadDialog", this);
				this.getView().addDependent(this.oUploadDialog);
			}
			this.oUploadDialog.open();
		},
		onImportToExcel : function(oEvent){
			let responsivetable = sap.ui.getCore().byId(
				"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::responsiveTable"
			);
			if (responsivetable.getSelectedItem()) {
				var oSelectedObject = responsivetable.getSelectedItem().getBindingContext().getObject();
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
						colList[value.FIELDNAME] = oSelectedObject[value.FIELDNAME] ? oFormat.format(new Date(oSelectedObject[value.FIELDNAME])) : null;
					}else{
					colList[value.FIELDNAME] = oSelectedObject[value.FIELDNAME];
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
			}else{
				sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("selectitem"));
			}
		},
		removeElements: function (array, elementsToRemove) {
			// Create a Set from the elements to remove for efficient lookup
			const removalSet = new Set(elementsToRemove);

			// Filter the array to remove the elements that are in the removal set
			return array.filter(item => !removalSet.has(item));
		}

	});
});