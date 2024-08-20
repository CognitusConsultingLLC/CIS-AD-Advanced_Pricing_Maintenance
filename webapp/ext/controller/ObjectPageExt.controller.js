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
			//	this.initializeJSONModel();
			let that = this;

			//this.setTableColumnData();
			let oRouter = this.getOwnerComponent().getRouter();

			// oRouter.getRoute("xCGDCxI_PRICING_MAIN/toCondCat").attachMatched(this.onRouteMatched, this);
			oRouter.attachRouteMatched(this.onRouteMatched, this);

			// let oModel = this.getOwnerComponent().getModel();
			// oModel.attachRequestCompleted(this.onRouteMatched, this);
			if (sap.ui.getCore().byId(
					"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::responsiveTable"
				)) {
				let oCustomFieldsTable = that.getOwnerComponent().getModel("CustomFields").getData();
				let table = sap.ui.getCore().byId(
					"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::Table"
				);
				let sInitiallyVisibleFields = Object.keys(oCustomFieldsTable).map(function (k) {
					return oCustomFieldsTable[k].FIELDNAME.toLowerCase()
				}).join(",");
				table.setInitiallyVisibleFields(sInitiallyVisibleFields);

			}

			this.extensionAPI.attachPageDataLoaded(function (oEvent) {
				{
					let spath = oEvent.context.getPath();
					that.object = that.getView().getBindingContext().getObject(spath);
					that.onRouteMatched();
				}
			});
		},
		onRouteMatched: function () {
			if (this.getView().getId(
					"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_PRICING_MAIN"
				)) {
				if (this.getView().getBindingContext()) {
					let spath = this.getView().getBindingContext().sPath;
					this.object = this.getView().getBindingContext().getObject(spath);
					if (this.object.Kotab) {
						this.setTableColumnData(this.object.Kotab);
						this.getView().getModel().refresh();
					}
					if (sap.ui.getCore().byId(
							"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::responsiveTable"
						)) {
						let oCustomFieldsTable = this.getOwnerComponent().getModel("CustomFields").getData();
						let table = sap.ui.getCore().byId(
							"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::Table"
						);
						let sInitiallyVisibleFields = Object.keys(oCustomFieldsTable).map(function (k) {
							return oCustomFieldsTable[k].FIELDNAME.toLowerCase()
						}).join(",");
						table.setInitiallyVisibleFields(sInitiallyVisibleFields);
					}

				}
			}
		},
		setTableColumnData: function (Kotab) {
			let that = this;
			if (this.getView().getBindingContext()) {
				let oModel = this.getView().getModel();
				let filters = [];
				let oPath = '/xcgdcxi_pricing_t_key';
				filters.push(new sap.ui.model.Filter("TABNAME", sap.ui.model.FilterOperator.EQ, Kotab));
				oModel.read(oPath, {
					filters: filters,
					success: function (oData) {
						let tableColumn = oData.results;
						that.getOwnerComponent().getModel("CustomFields").setData(tableColumn);
						if (sap.ui.getCore().byId(
								"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::Table"
							)) {

						}

						//	that.setColumnVisiblity();
					},
					error: function (oError) {}
				});
			}
		},
		onBeforeRendering: function () {
			if (sap.ui.getCore().byId(
					"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::responsiveTable"
				)) {
				let oCustomFieldsTable = this.getOwnerComponent().getModel("CustomFields").getData();
				let table = sap.ui.getCore().byId(
					"CGDC.CIS-AD-Pricing-Maintenance::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::Table"
				);
				let sInitiallyVisibleFields = Object.keys(oCustomFieldsTable).map(function (k) {
					return oCustomFieldsTable[k].FIELDNAME.toLowerCase()
				}).join(",");
				table.setInitiallyVisibleFields(sInitiallyVisibleFields);

			}
		}

	});
});