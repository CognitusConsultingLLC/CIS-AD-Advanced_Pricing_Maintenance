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
								that.Vbeln = that.object.Vbeln;

							}
							if (that.object.kotab) {
								that.aTable = that.object.kotab;
								that.Kschl = that.object.kschl;
								that.Vbeln = that.object.Vbeln;

							}
							that.setTableColumnData(that.aTable, that.Kschl,that.Vbeln);
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
									if (that.additionalData === 'X'  || that.additionalData === undefined) {
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
			//let workbook = XLSX.read(xlsx_content);
				Object.keys(workbook.Sheets.Sheet1).map(function (k) {
					if(workbook.Sheets.Sheet1[k].w && workbook.Sheets.Sheet1[k].w.split("/").length > 1 && Number.isInteger(workbook.Sheets.Sheet1[k].v)){
						var iDay = XLSX.SSF.parse_date_code(workbook.Sheets.Sheet1[k].v).d;
						var iMonth = XLSX.SSF.parse_date_code(workbook.Sheets.Sheet1[k].v).m;
						var iYear = XLSX.SSF.parse_date_code(workbook.Sheets.Sheet1[k].v).y;
						workbook.Sheets.Sheet1[k].v = new Date(iMonth+"-"+iDay+"-"+iYear);
					//	workbook.Sheets.Sheet1[k].v = new Date(workbook.Sheets.Sheet1[k].w); //new Date(workbook.Sheets.Sheet1[k].w.split("/")[1] +'-'+ workbook.Sheets.Sheet1[k].w.split("/")[0] +'-'+ workbook.Sheets.Sheet1[k].w.split("/")[2]);
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
						// if(Number.isInteger(value[oColumn.FIELDNAME]) || value[oColumn.FIELDNAME].split(".").length > 1){
						// var iDay = XLSX.SSF.parse_date_code(value[oColumn.FIELDNAME]).d;
						// var iMonth = XLSX.SSF.parse_date_code(value[oColumn.FIELDNAME]).m;
						// var iYear = XLSX.SSF.parse_date_code(value[oColumn.FIELDNAME]).y;
						// value[oColumn.FIELDNAME] =  new Date(iMonth+"-"+iDay+"-"+iYear);
							
						// }
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
					cc_extid :"",
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
			if(this.GroupCode === 2){
				this.oGroupDialog.close();
				sap.m.MessageToast.show("Development in progress for Mintaining the Group");
				return;
			}
			var oModelContexts = oEvent.getSource().getModel().mContexts;
			let responsivetable = sap.ui.getCore().byId(
				"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::responsiveTable"
			);
			var oForm = sap.ui.core.Fragment.byId("idFragGrpDialog", "idmbismartform1");
			var oObject = oForm.getBindingContext().getObject();
			var oModel1 = this.getView().getModel("Items");
			var aArray = oModel1.getData().results;
			for (var i = 0; i < aArray.length; i++) {
					delete aArray[i].key;
					delete aArray[i].NEWENTRY;
				//	delete aArray[i].modified;
			}
			var oTableData = btoa(JSON.stringify(aArray));
			var sCcdoc = this.getView().getBindingContext().getObject().cc_docno;
			var sPath = "/Crt_Group", that = this;
			var oCurrObject = this.getView().getBindingContext().getObject();			
			this.showBusyIndicator();
				var oPromise = this.extensionAPI.invokeActions(sPath,this.getView().getBindingContext(),{
					Pmprf : oCurrObject.Pmprf,
					Kschl : oCurrObject.Kschl,
					Kotab : oCurrObject.Kotab,
					Vbeln : oCurrObject.Vbeln,
					mganr : oCurrObject.mganr,
					cc_docno : oCurrObject.cc_docno,
					Subct : oCurrObject.Subct,
					Counter : oCurrObject.Counter,
					key1 : "X",
					CC_GRPID : "",
					CC_DESC : oObject.cc_desc,
					CC_EXTID : oObject.cc_extid,
					CC_ENDT : oObject.cc_endt,
					Value : oTableData
				});
				oPromise.then(
					function (aResponse) {
						that.hideBusyIndicator();
						that.oGroupDialog.close();
						that._performResetChanges(oModelContexts,"/CC_Group_Header");
					//	that._onGroupCreateRestoreSuccess(that, aResponse);
					},
					function (oError) {
						that.hideBusyIndicator();
					});			
		 },
		showBusyIndicator: function () {
			if (!this._busyIndicator) {
				this._busyIndicator = new BusyDialog({
					showCancelButton: false
				});
				this._busyIndicator.open();
			}
		},
		hideBusyIndicator: function () {
			if (this._busyIndicator) {
				this._busyIndicator.close();
				this._busyIndicator = null;
			}
		},
		onValueHelpRequested1 : function(oEvent){
		//	this.oSource = oEvent.getSource();
			this.iIndex = parseInt(oEvent.getSource().sId.split("-")[4]);
			var oCurrObject = this.getView().getBindingContext().getObject();
			var that = this;
			var oView = this.getView();
			var oCols = {
				"cols" : []
			};
			var oFieldsEntityType = this.getView().getModel().getServiceMetadata().dataServices.schema[0].entityType.find(x => x.name === 'CC_Group_VHType');
				oFieldsEntityType.property.forEach((field,fieldIndex)=>{
					var oCol={};
					oCol["template"] = field.name;
					field.extensions.forEach((oExtension,extIndex)=>{
						if(oExtension.name === "label"){
							oCol["label"] = oExtension.value;
						}
					})
					oCols.cols.push(oCol);
					});
			var omodel = new sap.ui.model.json.JSONModel(oCols);
			var aCols = oCols.cols;
			Fragment.load({
				name: "CGDC.CIS-AD-Pricing-Maintenance.ext.fragments.FieldNameVh",
				controller: this
			}).then(function (oValueHelpDialog) {
				this._oValueHelpDialog = sap.ui.xmlfragment(oView.getId(), "CGDC.CIS-AD-Pricing-Maintenance.ext.fragments.FieldNameVh", this);
				this.getView().addDependent(this._oValueHelpDialog);
				this._oValueHelpDialog.getTableAsync().then(function (oTable) {
					oTable.setModel(this.getView().getModel());
					oTable.setModel(omodel, "columns");
					var aSorter = new sap.ui.model.Sorter("Pspnr", false, false);
					var aFilters = [];
					// aFilters.push(new sap.ui.model.Filter("Pmprf", sap.ui.model.FilterOperator.EQ, oCurrObject.Pmprf));
					// aFilters.push(new sap.ui.model.Filter("Kschl", sap.ui.model.FilterOperator.EQ, oCurrObject.Kschl));
					// aFilters.push(new sap.ui.model.Filter("Kotab", sap.ui.model.FilterOperator.EQ, oCurrObject.Kotab));
					if (oTable.bindRows) {
						oTable.bindAggregation("rows", {
							path: "/CC_Group_VH",
							filters : aFilters
						});
					}

					if (oTable.bindItems) {
						oTable.bindAggregation("items", {
							path: "/CC_Group_VH",
							filters : aFilters,
							template: function () {
								return new sap.m.ColumnListItem({
									cells: aCols.map(function (column) {
										return new sap.m.Label({
											text: "{" + column.template + "}"
										});
									})
								});
							}
						});
					}
					if (oTable.getBinding()) {
						oTable.getBinding().attachDataReceived(function (oEvent) {
							oView.setBusy(false);
						}.bind(this));
						oTable.getBinding().attachDataRequested(function (oEvent) {
							oView.setBusy(true);
						}.bind(this));
					}
					this._oValueHelpDialog.update();
					this.onClickGo();
				}.bind(this));
				this._oValueHelpDialog.open();
			}.bind(this));
		},
		onValueHelpRequestedValue : function(oEvent){
			var oObect = oEvent.getSource().getModel("Items").getObject(oEvent.getSource().getParent().getBindingContextPath());
			var oCurrObject = this.getView().getBindingContext().getObject();
			var that = this;
			var oView = this.getView();
			var oCols = {
				"cols" : [{
					"label" :"MaintenanceOrder",
					"template" :"MaintenanceOrder"
				}]
			};
			var omodel = new sap.ui.model.json.JSONModel(oCols);
			var aCols = oCols.cols;
			Fragment.load({
				name: "CGDC.CIS-AD-Pricing-Maintenance.ext.fragments.ValueVh",
				controller: this
			}).then(function (oValueHelpDialog) {
				this._oValueHelpDialog2 = sap.ui.xmlfragment(oView.getId(), "CGDC.CIS-AD-Pricing-Maintenance.ext.fragments.ValueVh", this);
				this.getView().addDependent(this._oValueHelpDialog);
				this._oValueHelpDialog2.getTableAsync().then(function (oTable) {
					oTable.setModel(this.getView().getModel());
					oTable.setModel(omodel, "columns");
					var aSorter = new sap.ui.model.Sorter("Pspnr", false, false);
					var aFilters = [];
					// aFilters.push(new sap.ui.model.Filter("Pmprf", sap.ui.model.FilterOperator.EQ, oCurrObject.Pmprf));
					// aFilters.push(new sap.ui.model.Filter("Kschl", sap.ui.model.FilterOperator.EQ, oCurrObject.Kschl));
					// aFilters.push(new sap.ui.model.Filter("Kotab", sap.ui.model.FilterOperator.EQ, oCurrObject.Kotab));
					if (oTable.bindRows) {
						oTable.bindAggregation("rows", {
							path: "/I_MaintenanceOrderStdVH",
							filters : aFilters
						});
					}

					if (oTable.bindItems) {
						oTable.bindAggregation("items", {
							path: "/I_MaintenanceOrderStdVH",
							filters : aFilters,
							template: function () {
								return new sap.m.ColumnListItem({
									cells: aCols.map(function (column) {
										return new sap.m.Label({
											text: "{" + column.template + "}"
										});
									})
								});
							}
						});
					}
					if (oTable.getBinding()) {
						oTable.getBinding().attachDataReceived(function (oEvent) {
							oView.setBusy(false);
						}.bind(this));
						oTable.getBinding().attachDataRequested(function (oEvent) {
							oView.setBusy(true);
						}.bind(this));
					}
					this._oValueHelpDialog2.update();
					this.onClickGo();
				}.bind(this));
				this._oValueHelpDialog2.open();
			}.bind(this));
		},
		onValueHelpCancelPress2: function (oEvent) {
			oEvent.getSource().close();
		},
		onValueHelpOkPressWp: function (oEvent) {
		//	this.getView().getModel("Items").setProperty("/fieldname", oEvent.getParameters("newValue").newValue);
		//oEvent.getParameters().tokens[0]
		var oRecrod = oEvent.getSource().getModel("Items").getData().results[this.iIndex];
		oRecrod.fieldname = oEvent.getParameters().tokens[0].getKey();
		oEvent.getSource().getModel("Items").refresh(true);
		this._oValueHelpDialog.close();
		},
		onValueHelpRequested : function(oEvent){
			this.iIndex = parseInt(oEvent.getSource().sId.split("-")[4]);
			if (!this.oVHDialog) {
				this.oVHDialog = sap.ui.xmlfragment("idFragVhDialog",
					"CGDC.CIS-AD-Pricing-Maintenance.ext.fragments.VHDialog", this);
				this.getView().addDependent(this.oVHDialog);
			}
			this.oVHDialog.open();
		},
		onSelectionChangeFieldName : function(oEvent){
			var sFieldName = oEvent.getParameters().listItem.getBindingContext().getObject().Fieldname;
			var oRecrod = oEvent.getSource().getModel("Items").getData().results[this.iIndex];
			oRecrod.fieldname = sFieldName;
			oEvent.getSource().getModel("Items").refresh(true);
			this.oVHDialog.close();
		},
		onInitialiseSmartFilterVHDialog : function(oEvent){
			
			var oCurrObject = this.getView().getBindingContext().getObject();
			var oFilterBar = oEvent.getSource();
			oFilterBar.getVariantManagement().setVisible(false);
			var oFilter = {
				"Pmprf": oCurrObject.Pmprf,
				"Kschl": oCurrObject.Kschl,
				"Kotab": oCurrObject.Kotab //oData.EquipmentNo
			};
		//	oFilterBar.setFilterData([]);
			oFilterBar.setFilterData(oFilter);
			// var oSmartTable = sap.ui.core.Fragment.byId("idFragVhDialog", "projecttablefieldname");
			// oSmartTable.rebindTable();
			 var aFilters = [];
			 this._oValueHelpDialog.getTable().getBinding().filter([]);
			// 		aFilters.push(new sap.ui.model.Filter("Pmprf", sap.ui.model.FilterOperator.EQ, oCurrObject.Pmprf));
			// 		aFilters.push(new sap.ui.model.Filter("Kschl", sap.ui.model.FilterOperator.EQ, oCurrObject.Kschl));
			// 		aFilters.push(new sap.ui.model.Filter("Kotab", sap.ui.model.FilterOperator.EQ, oCurrObject.Kotab));
			var aFilters = oFilterBar.getFilters().length ? oFilterBar.getFilters()[0].aFilters : [];
			aFilters.forEach(function(filter1,index){
				if(filter1.aFilters){
					filter1.aFilters.forEach(function(filter2,index2){
						aFilters.push(filter2);
					})
				}else{
					aFilters.push(filter1);
				}
			 })
			 this._oValueHelpDialog.getTable().getBinding().filter(aFilters);
		},
		onSuggest: function (oEvent) {
			var oFieldsEntityType = this.getView().getModel().getServiceMetadata().dataServices.schema[0].entityType.find(x => x.name === 'CC_Group_VHType');
			var that = this;
			this.aCells = [];
			oFieldsEntityType.property.forEach((field,fieldIndex)=>{
				that.aCells.push(new sap.m.Label({
							text : '{'+field.name+'}'
						})
				);
			})
			this.iIndex2 = parseInt(oEvent.getSource().sId.split("-")[4]);
			var oCurrObject = this.getView().getBindingContext().getObject();
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilter = [];
			if (oEvent.getSource().getCustomData()[0].getValue() === "Group") {
				aFilter.push(new sap.ui.model.Filter("Fieldname", sap.ui.model.FilterOperator.Contains, sTerm));
			} else {
				aFilter.push(new sap.ui.model.Filter("Fieldname", sap.ui.model.FilterOperator.Contains, sTerm));
			}
				aFilter.push(new sap.ui.model.Filter("Pmprf", sap.ui.model.FilterOperator.EQ, oCurrObject.Pmprf));
				aFilter.push(new sap.ui.model.Filter("Kschl", sap.ui.model.FilterOperator.EQ, oCurrObject.Kschl));
				aFilter.push(new sap.ui.model.Filter("Kotab", sap.ui.model.FilterOperator.EQ, oCurrObject.Kotab));
			oEvent.getSource().getBinding("suggestionRows").filter(aFilter);
			oEvent.getSource().setFilterSuggests(false);
		},
		onSuggestionItemSelected: function (oEvent) {
			if (oEvent.getParameters("selectedRow").selectedRow) {
				//	oEvent.getSource().setValueState("None");
				var oObject = oEvent.getSource().getModel().getObject(oEvent.getParameter("selectedRow").getBindingContextPath());
			//	var sKey = oEvent.getSource().getModel("Items").getObject(oEvent.getSource().getParent().getParent().getBindingContextPath()).key;
				var oModel1 = this.getView().getModel("Items");
				var oRecrod = oEvent.getSource().getModel("Items").getData().results[this.iIndex2];
			oRecrod.fieldname = oObject.Fieldname;
			oModel1.refresh(true);
			}
		},
		onClickGo : function(oEvent){
			// var oSmartTable = oEvent.getSource().getParent().getContent()[1];
			// oSmartTable.rebindTable();
		//	this._oValueHelpDialog.getTable().getBinding().filter([]);
			var oSmartBar =this._oValueHelpDialog.getFilterBar();
			var aFilters = oSmartBar.getFilters().length ? oSmartBar.getFilters()[0].aFilters : [];
			// aFilters.forEach(function(filter1,index){
			// 	if(filter1.aFilters){
			// 	filter1.aFilters.forEach(function(filter2,index2){
			// 		aFilters.push(filter2);
			// 	})
			// }else{
			// 	aFilters.push(filter1);
			// }
			//  })
			
			 this._oValueHelpDialog.getTable().getBinding().filter(aFilters);
			//  if(aFilters.length === 0){
			//  this._oValueHelpDialog.getTable().getBinding().sFilterParams = '';
			//  }
		},
		onBeforeRebindFieldNameSTVH : function(oEvent){
			 var oSmartBar = oEvent.getSource().getParent().getContent()[0];
			 var aFilters = oSmartBar.getFilters().length ? oSmartBar.getFilters()[0].aFilters : [];
			 var binding = oEvent.getParameter("bindingParams");
			 binding.filters = [];
			 aFilters.forEach(function(filter1,index){
				filter1.aFilters.forEach(function(filter2,index2){
					binding.filters.push(filter2);
				})
			 })
			// binding.filters.push(aFilters);
			// var oCurrObject = this.getView().getBindingContext().getObject();
			
			// var aFilter = new sap.ui.model.Filter("Pmprf", sap.ui.model.FilterOperator.EQ, oCurrObject.Pmprf);
			// var aFilter1 = new sap.ui.model.Filter("Kschl", sap.ui.model.FilterOperator.EQ, oCurrObject.Kschl);
			// var aFilter2 = new sap.ui.model.Filter("Kotab", sap.ui.model.FilterOperator.EQ, oCurrObject.Kotab);
			// binding.filters.push(aFilter);
			// binding.filters.push(aFilter1);
			// binding.filters.push(aFilter2);
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
			var oTable = sap.ui.core.Fragment.byId("idFragGrpDialog", "RmaSoItemTable");
			var oItems = oTable.getItems(), aColumns = [],that = this;this.aCells= [];this.aRows=[];
			var oFieldsEntityType = this.getView().getModel().getServiceMetadata().dataServices.schema[0].entityType.find(x => x.name === 'CC_Group_VHType');
			oFieldsEntityType.property.forEach((field,fieldIndex)=>{
				field.extensions.forEach((oExtension,extIndex)=>{
					if(oExtension.name === "label"){
						aColumns.push(new sap.m.Column({
							hAlign:"Begin",
							popinDisplay: "Inline",
							demandPopin: false,
							header :[
								new sap.m.Label({
									text : oExtension.value
								})
							]
						}));
					}
				})
				that.aCells.push(new sap.m.Label({
							text : '{'+field.name+'}'
						})
				);
			})
				oItems.forEach((oItem, itemindex)=>{
					oItem.getCells().forEach((oCell,cellindex)=>{
						if(oCell.getCustomData().length !== 0 && oCell.getCustomData()[0].getValue() === "FieldName"){
							aColumns.forEach((oColumn,columnindex)=>{
								oCell.addSuggestionColumn(oColumn);
							})
							// aRows.forEach((oRow,rowindex)=>{
							// 	oCell.addSuggestionRow(oRow);
							// })
						}
					})
				})
		},
		factoryforsuggeestionRows : function(oEvent,index,key){
			return new sap.m.ColumnListItem({
				cells :[
					new sap.m.Label({
						text : '{Pmprf}'
					}),
					new sap.m.Label({
						text : '{Kschl}'
					}),
					new sap.m.Label({
						text : '{Kotab}'
					}),
					new sap.m.Label({
						text : '{Sequn}'
					}),
					new sap.m.Label({
						text : '{Fieldname}'
					})
				]
			})

			// var oClumnlist = new sap.m.ColumnListItem({
			// 	cells:[]
			// });
			// this.aCells.forEach((arow,rowindex)=>{
			// 	oClumnlist.addCell(arow);
			// });
			// return oClumnlist;
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