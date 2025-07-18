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

	return sap.ui.controller("cgdc.pricing.maint.ext.controller.ObjectPageExt", {
		onInit: function () {
			let that = this;
			this.extensionAPI.attachPageDataLoaded(function (oEvent) {
				{

					const oToolbar = that.getView().byId("cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::Table::Toolbar");
					if (oToolbar && !sap.ui.getCore().byId("idFilterBy")) {
						const oLabel = new sap.m.Label({
							text: "{i18n>FilterBy}",
						});

						const oComboBox = new sap.m.ComboBox("idFilterBy", {
							change: that.onFilterChange,
							selectedKey:"ACTIVE_FLT"
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
						
						that.onFilterCallBack("ACTIVE_FLT");
						
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

					that.flowDown = oEvent.context.getProperty('FlowDownVis');
					that.Scales = oEvent.context.getProperty('ScalesVis');

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
							"cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--edit");
						if (edit) {
							edit.attachPress(that.editPress, that);
						}

					}
				}
			});
		},
		editPress: function () {
			if (sap.ui.getCore().byId(
				"cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--Home::Form")) {
				let createForm = sap.ui.getCore().byId(
					"cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--Home::Form");
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

		onAfterRendering: function () {
			var that = this;
			this.vbelnLength = "";
			var oModel = this.getView().getModel();
			oModel.metadataLoaded().then(function () {
				var oMetadata = oModel.getServiceMetadata();
				var aEntityTypes = oMetadata.dataServices.schema[0].entityType;

				aEntityTypes.forEach(function (entity) {
					entity.property.forEach(function (prop) {
						if (prop.name === "Vbeln") {
							that.vbelnLength = parseInt(prop.maxLength, 10); //converts it to the number 10, using base 10.
							return;
						}
					});
				});
			}, this);
		},

		onBeforeRebindTableExtension: function (oEvent) {
			const oBindingParams = oEvent.getParameter("bindingParams");
			const oTable = oEvent.getSource(); // The SmartTable instance

			// Check if this is the specific table you want to filter
			if (oTable.getId().includes("xCGDCxI_CONDITON_CATALOG--ItemDetails::Table")) {
				const oModel = sap.ui.getCore().getModel("customFilterModel");
				const aFilters = oModel?.getProperty("/filters") || [];
				oBindingParams.filters.push(...aFilters);
			}


		},

		onFilterCallBack:function(sFilterKey){
			var oSmartTable = sap.ui.getCore().byId("cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::responsiveTable"); // Smart Table instance
			var aFilters = []; // Initialize empty filter array
			var oCurrentDate = new Date();
			var options = { month: "short", day: "2-digit", year: "numeric" };
			var sFormattedDate = oCurrentDate.toLocaleDateString("en-US", options);

			switch (sFilterKey) {
				case "ACTIVE_FLT":
					aFilters.push(new sap.ui.model.Filter("datab", "EQ", sFormattedDate));
					break;
				case "DELETE_FLT":
					aFilters.push(new sap.ui.model.Filter("loevm_ko", "EQ", true));
					break;
				case "EXPIRE_FLT":
					aFilters.push(new sap.ui.model.Filter("datab", "LT", sFormattedDate));
					break;
				case "FUTURE_FLT":
					aFilters.push(new sap.ui.model.Filter("datab", "GT", sFormattedDate));
					break;
				case "ALL_FLT":
					// No filters applied, show all records
					break;
			}



			var oModel = sap.ui.getCore().getModel("customFilterModel") || new sap.ui.model.json.JSONModel();
			oModel.setProperty("/filters", aFilters);
			sap.ui.getCore().setModel(oModel, "customFilterModel");

			// var oBinding = oSmartTable.getParent().getTable().getBinding("items");
			// if (oBinding) {
			// 	oBinding.filter(aFilters); // Apply filters
			// }

			oSmartTable.getParent().rebindTable();
		},

		onFilterChange: function (oEvent) {
			var sFilterKey = oEvent.getSource().getSelectedKey(); // Get selected filter type
			if (!sFilterKey) {
				this.setValueState("Error");
				this.setValueStateText("Please select a valid option.");
				return;
			} else {
				this.setValueState("None");
			}
			this.getParent().getParent().getParent()._getView().getController().onFilterCallBack(sFilterKey);
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
					urlParameters: {
						"$top": "1000"
					},
					success: function (oData) {
						let tableColumn = oData.results;
						that.getOwnerComponent().getModel("CustomFields").setData(tableColumn);
						if (sap.ui.getCore().byId(
							"cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--Home::Form")) {
							let createForm = sap.ui.getCore().byId(
								"cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--Home::Form");
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
							"cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--Price::Form")) {
							let oPriceForm = sap.ui.getCore().byId(
								"cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--Price::Form");
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
							"cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--AddData::Form")) {
							let oAddDataForm = sap.ui.getCore().byId(
								"cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--AddData::Form");
							let addSection = sap.ui.getCore().byId(
								"cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--AddData::Section"
							);
							addSection.setVisible(true);
							if (that.additionalData === 'X' || tableColumn[0].AddDataVis === 'X') //Added by AGUSAIN to hide add data tab
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

						//START:Hide flowdown and scales tab
						if (sap.ui.getCore().byId("cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--template::ObjectPage::ObjectPageHeader")) {
							if (sap.ui.getCore().byId("cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--template::ObjectPage::ObjectPageHeader").getBindingContext().getObject().knumh) {
								if (tableColumn[0].DeliveryButnVis === '') {
									sap.ui.getCore().byId('cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--action::ActionxDeliveryReleaseAndSchedulexButtonxHeader').setVisible(true);
								} else if (tableColumn[0].DeliveryButnVis === 'X') {
									sap.ui.getCore().byId('cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--action::ActionxDeliveryReleaseAndSchedulexButtonxHeader').setVisible(false);
								}
							} else {
								sap.ui.getCore().byId('cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--action::ActionxDeliveryReleaseAndSchedulexButtonxHeader').setVisible(false);
							}
						}


						let oFlowdownForm = sap.ui.getCore().byId(
							"cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--FlowData::Form");
						if (oFlowdownForm) {
							let flowDownSection = sap.ui.getCore().byId(
								"cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--FlowData::Section"
							);
							flowDownSection.setVisible(true);
							if (that.flowDown === 'X' || tableColumn[0].FlowDownVis === 'X') {
								flowDownSection.setVisible(false);
							}

						}

						let oScalesTable = sap.ui.getCore().byId("cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--ItemDetails::Table");
						if (oScalesTable) {
							let scalesSection = sap.ui.getCore().byId("cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CNC_MAIN--ItemDetails::SubSection");
							scalesSection.setVisible(true);
							if (that.Scales === 'X' || tableColumn[0].ScalesVis === 'X') {
								scalesSection.setVisible(false);
							}

						}

						//END:Hide flowdown and scales tab

						if (sap.ui.getCore().byId(
							"cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::Table"
						)) {
							let smarttable = sap.ui.getCore().byId(
								"cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::Table"
							);
							let responsivetable = sap.ui.getCore().byId(
								"cgdc.pricing.maint::sap.suite.ui.generic.template.ObjectPage.view.Details::xCGDCxI_CONDITON_CATALOG--ItemDetails::responsiveTable"
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

		onNavigateToMngDelvSchl: function (oEvent) {
			if (oEvent?.getSource()?.getParent()?.getParent()?.getSelectedItems) {
				var sObject = oEvent.getSource().getParent().getParent().getSelectedItems()[0].getBindingContext().getObject();
			} else {
				var sObject = oEvent.getSource().getBindingContext().getObject();
			}
			let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			if (sObject.knumh) {

				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#DeliveryReleaseSchedule-manage?Knumh='" + sObject.knumh + "'&Kotab='" + sObject.kotab + "'&Kschl='" + sObject.kschl +
							"'&Pmprf='" + sObject.pmprf + "'&/xCGDCxC_ConditionRecDeliveryRS(ConditionRecordNo='" + sObject.knumh + "',IsActiveEntity=true)"
					}
				});

			} else {
				sap.m.MessageBox.information(oResourceBundle.getText("NavigationError"));
			}

		},

		onNavigateToDocumentFlow: function (oEvent) {
			var oSelectedItem = oEvent.getSource().getParent().getParent().getSelectedItems();
			var sVbeln = oSelectedItem[0].getBindingContext().getObject("vbeln");
			var sPosnr = oSelectedItem[0].getBindingContext().getObject("posnr");
			var sElin = oSelectedItem[0].getBindingContext().getObject("xcgdcxeline");
			var sNeline = oSelectedItem[0].getBindingContext().getObject("xcgdcxneline");

			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			// oCrossAppNavigator.toExternal({
			// 	target: {
			// 		shellHash: "#CISADDocumentFlow-display&/xCGDCxC_CNCDocumentFlow(ReferenceSDDocument='" + sVbeln + "',ReferenceSDDocumentItem='" + sPosnr + "',OriginatingELIN='" + sElin + "',OriginatingNELIN='" + sNeline + "',IsActiveEntity=false)"
			// 	}
			// });

			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: "CISADDocumentFlow",
					action: "display"
				},
				params: {
					ReferenceSDDocument: sVbeln,
					ReferenceSDDocumentItem: sPosnr,
					OriginatingELIN: sElin,
					OriginatingNELIN: sNeline
				}
			});

		},

		onNavigateToChangeLog: function (oEvent) {
			var oSelectedItem = "";
			var sVbeln = "";
			var sKnumh = "";
			var sObjectClass = "";
			var sTabName = "";

			oSelectedItem = oEvent.getSource().getParent().getParent().getSelectedItems();
			sTabName = oSelectedItem[0].getBindingContext().getObject().extension_tab;
			sVbeln = oSelectedItem[0].getBindingContext().getObject().vbeln.padStart(this.vbelnLength, "0");
			sKnumh = oSelectedItem[0].getBindingContext().getObject().knumh;
			sObjectClass = "CNC";


			sap.ushell.Container.getService("CrossApplicationNavigation").toExternal({
				target: {
					semanticObject: "cgdcchangelog",
					action: "display"
				},
				params: {
					objectclass: sObjectClass,
					objectid: sVbeln,
					tabname: sTabName,
					tab_key: sKnumh
				}
			});


		}

	});
});