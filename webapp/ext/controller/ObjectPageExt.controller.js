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
					that.object = that.extractParameters(oEvent.context.getDeepPath());
					if (that.object) {
						if (that.object.Kotab) {
							that.aTable = that.object.Kotab;
							that.Kschl = that.object.Kschl;
							that.Vbeln = that.object.Vbeln;
						}
						if (that.object.kotab) {
							that.aTable = that.object.kotab;
							that.Kschl = that.object.kschl;
							that.Vbeln = that.object.vbeln;
						}
						that.setTableColumnData(that.aTable, that.Kschl, that.Vbeln);
					}
				}
			});
		},
		extractParameters: function(inputString) {
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

		setTableColumnData: function (Kotab, Kschl, Vbeln) {
			let that = this;
			if (this.getView().getBindingContext()) {
				let oModel = this.getView().getModel();
				let filters = [];
				let oPath = '/xcgdcxi_pricing_t_key';
				filters.push(new sap.ui.model.Filter("TABNAME", sap.ui.model.FilterOperator.EQ, Kotab));
				filters.push(new sap.ui.model.Filter("KSCHL", sap.ui.model.FilterOperator.EQ, Kschl));
				filters.push(new sap.ui.model.Filter("VBELN", sap.ui.model.FilterOperator.EQ, Vbeln));
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
							//	that.getView().getModel().refresh(true);

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
		removeElements: function (array, elementsToRemove) {
			// Create a Set from the elements to remove for efficient lookup
			const removalSet = new Set(elementsToRemove);

			// Filter the array to remove the elements that are in the removal set
			return array.filter(item => !removalSet.has(item));
		}

	});
});