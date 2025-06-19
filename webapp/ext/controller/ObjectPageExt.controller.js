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
	"sap/ui/comp/state/UIState"

], function (ControllerExtension, JSONModel, Fragment, ODataModel, Filter, FilterOperator, ListItem, Sorter, BusyDialog, UIState) {
	"use strict";

	return sap.ui.controller("CGDC.CIS-AD-Pricing-Maintenance.ext.controller.ObjectPageExt", {
		onInit: function () {
			let that = this;
			this.extensionAPI.attachPageDataLoaded(function (oEvent) {
				{

					const oToolbar = that.getView().byId("CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::Table::Toolbar");
					if (oToolbar) {
						const oLabel = new sap.m.Label({
							text: "{i18n>FilterBy}",
						});

						const oComboBox = new sap.m.ComboBox({
							change: that.onFilterChange
						});
						let oResourceBundle = that.getView().getModel("i18n").getResourceBundle();
						const oFilterModel = new sap.ui.model.json.JSONModel({
							filters: [
								{ "text": oResourceBundle.getText("ActiveRecords"), "key": "ACTIVE_FLT" },
								{ "text": oResourceBundle.getText("AllRecords"), "key": "ALL_FLT" },
								{ "text": oResourceBundle.getText("DeletedRecords"), "key": "DELETE_FLT" },
								{ "text": oResourceBundle.getText("ExpiredRecords"), "key": "EXPIRE_FLT" },
								{ "text": oResourceBundle.getText("FutureRecords"), "key": "FUTURE_FLT" }
							]
						});

						oComboBox.setModel(oFilterModel, "filterModel");

						oComboBox.bindItems({
							path: "filterModel>/filters",
							template: new sap.ui.core.ListItem({
								key: "{filterModel>key}",
								text: "{filterModel>text}"
							})
						});

						oComboBox.setSelectedKey("ALL_FLT");

						// Find the index of the Filter button
						const aContent = oToolbar.getContent();
						const iFilterButtonIndex = aContent.findIndex(control =>
							control.getMetadata().getName() === "sap.m.Button"
							// && control.getText && control.getText().includes("filter")
						);

						// Insert before the Filter button
						const insertIndex = iFilterButtonIndex > 0 ? iFilterButtonIndex : aContent.length;
						oToolbar.insertContent(oLabel, insertIndex);
						oToolbar.insertContent(oComboBox, insertIndex + 1);

					}

					that.object = that.extractParameters(oEvent.context.getDeepPath());
					that.additionalData = oEvent.context.getProperty('AddDataVis');
					if (that.object) {
						if (that.object.Kotab) {
							that.aTable = that.object.Kotab;
							that.Kschl = that.object.Kschl;
							that.Pmprf = that.object.Pmprf;

						}
						if (that.object.kotab) {
							that.aTable = that.object.kotab;
							that.Kschl = that.object.kschl;
							that.Pmprf = that.object.Pmprf;

						}

						// that.showBusyIndicator();//Added by AGUSAIN to for fields visibility
						that.setTableColumnData(that.aTable, that.Kschl, that.Pmprf);
						// that.hideBusyIndicator();//Added by AGUSAIN to for fields visibility
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

		onFilterChange: function (oEvent) {
			var sFilterKey = oEvent.getSource().getSelectedKey(); // Get selected filter type
			var oSmartTable = sap.ui.getCore().byId("CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::responsiveTable"); // Smart Table instance
			var aFilters = []; // Initialize empty filter array
			var oCurrentDate = new Date();
			var options = { month: "short", day: "2-digit", year: "numeric" };
			var sFormattedDate = oCurrentDate.toLocaleDateString("en-US", options);

			switch (sFilterKey) {
				case "ACTIVE_FLT":
					// aFilters.push(new sap.ui.model.Filter("datab", "LE", sFormattedDate));
					aFilters.push(new sap.ui.model.Filter("datbi", "EQ", sFormattedDate));
					break;
				case "DELETE_FLT":
					aFilters.push(new sap.ui.model.Filter("loevm_ko", "EQ", true));
					break;
				case "EXPIRE_FLT":
					aFilters.push(new sap.ui.model.Filter("datab", "LT", sFormattedDate));
					// aFilters.push(new sap.ui.model.Filter("loevm_ko", "NE", true));
					break;
				case "FUTURE_FLT":
					// aFilters.push(new sap.ui.model.Filter("datab", "GT", sFormattedDate));
					aFilters.push(new sap.ui.model.Filter("datbi", "GT", sFormattedDate));
					// aFilters.push(new sap.ui.model.Filter("loevm_ko", "NE", true));
					break;
				case "ALL_FLT":
					// No filters applied, show all records
					break;
			}

			var oBinding = oSmartTable.getParent().getTable().getBinding("items");
			if (oBinding) {
				oBinding.filter(aFilters); // Apply filters
			}

			oSmartTable.getParent().rebindTable();
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

		setTableColumnData: function (Kotab, Kschl, Pmprf) {
			let that = this;
			if (this.getView().getBindingContext()) {
				let oModel = this.getView().getModel();
				let filters = [];
				let oPath = '/xcgdcxi_pricing_t_key';
				filters.push(new sap.ui.model.Filter("TABNAME", sap.ui.model.FilterOperator.EQ, Kotab));
				filters.push(new sap.ui.model.Filter("KSCHL", sap.ui.model.FilterOperator.EQ, Kschl));
				filters.push(new sap.ui.model.Filter("Pmprf", sap.ui.model.FilterOperator.EQ, Pmprf));
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
							if (that.additionalData === 'X'
								|| that.additionalData === undefined) //Added by AGUSAIN to hide add data tab
							{
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
										if (aAllSmartfield[i].getId().includes(aRequiredFields[j])) {
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
					error: function (oError) { }
				});
			}
		},
		removeElements: function (array, elementsToRemove) {
			// Create a Set from the elements to remove for efficient lookup
			const removalSet = new Set(elementsToRemove);

			// Filter the array to remove the elements that are in the removal set
			return array.filter(item => !removalSet.has(item));
		},
		showBusyIndicator: function () {
			if (!this._busyIndicator) {
				this._busyIndicator = new sap.m.BusyDialog({
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

	});
});