var Ext = window.Ext4 || window.Ext;
/* global _*/
/* global Rally */
Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        var that = this;

        //console.log(that.getSettings());
        that.STeamGoalField = that.getSetting('STeamGoalField');
        that.CostSavingsField = that.getSetting('CostSavingsField');
        that.DefectReductionField = that.getSetting('DefectReductionField');
        that.BusinessExpansionField = that.getSetting('BusinessExpansionField');
        that.CurrentWorkaroundField = that.getSetting('CurrentWorkaroundField');
        that.LegalCField = that.getSetting('LegalCField');
        that.EmployeeSelfSufficiencyField = that.getSetting('EmployeeSelfSufficiencyField');
        that.ESTechField = that.getSetting('ESTechField');
        that.PriorityScoreField = that.getSetting('PriorityScoreField');
        
        this._grid = null;
        this._piCombobox = this.add({
            xtype: "rallyportfolioitemtypecombobox",
            padding: 5,
            listeners: {
                //ready: this._onPICombobox,
                select: this._onPICombobox,
                scope: this
            }
        });
    },
    
    _onPICombobox: function() {
        var selectedType = this._piCombobox.getRecord();
        var model = selectedType.get('TypePath');
        
        if (this._grid !== null) {
            this._grid.destroy();
        }

        Ext.create('Rally.data.wsapi.TreeStoreBuilder').build({
            models: [ model ],
            listeners: {
                load: function(store) {
                    var records = store.getRootNode().childNodes;
                    this._calculateScore(records, true);
                },
                update: function(store, rec, modified, opts) {
                    this._calculateScore([rec], false);
                },
                scope: this
            },
           // autoLoad: true,
            enableHierarchy: true
        }).then({
            success: this._onStoreBuilt,
            scope: this
        });
    },
    
    _onStoreBuilt: function(store, records) {
        //var records = store.getRootNode().childNodes;
        var that = this;
        var selectedType = this._piCombobox.getRecord();
        var modelNames = selectedType.get('TypePath');
        
        var context = this.getContext();
        this._grid = this.add({
            xtype: 'rallygridboard',
            context: context,
            modelNames: [ modelNames ],
            toggleState: 'grid',
            stateful: false,
            plugins: [
                {
                    ptype: 'rallygridboardinlinefiltercontrol',
                    filterChildren: false,
                    inlineFilterButtonConfig: {
                        modelNames: [ modelNames ],
                        stateful: true,
                        stateId: context.getScopedStateId('custom-filter-example'),
                        inlineFilterPanelConfig: {
                            quickFilterPanelConfig: {
                                defaultFields: [
                                    'ArtifactSearch'
                                ],
                                addQuickFilterConfig: {
                                    whiteListFields: ['Milestones', 'Tags']
                                }
                            },
                            advancedFilterPanelConfig: {
                                advancedFilterRowsConfig: {
                                    propertyFieldConfig: {
                                        whiteListFields: ['Milestones', 'Tags']
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    ptype: 'rallygridboardfieldpicker',
                    headerPosition: 'left',
                    modelNames: [ modelNames ],
                    stateful: true,
                    stateId: context.getScopedStateId('columns-example')
                },
                {
                    ptype: 'rallygridboardactionsmenu',
                    menuItems: [
                        {
                            text: 'Export...',
                            handler: function() {
                                window.location = 
                                    Rally.ui.gridboard.Export.buildCsvExportUrl(this.down('rallygridboard').getGridOrBoard());
 


                            },
                            scope: this
                        }
                    ],
                    buttonConfig: {
                        iconCls: 'icon-export'
                    }
                }
            ],
            gridConfig: {
                store: store,
                columnCfgs: [
                    'Name',
                    that.STeamGoalField, 
                    that.CostSavingsField,
                    that.DefectReductionField,
                    that.BusinessExpansionField, 
                    that.CurrentWorkaroundField, 
                    that.LegalCField, 
                    that.EmployeeSelfSufficiencyField, 
                    that.ESTechField,
                    {
                        text: "Priority Score",
                        dataIndex: that.PriorityScoreField,
                        editor: null
                    }
                ]
            },
            height: this.getHeight()
        });
    },
    
    _calculateScore: function(records,loading)  {
        var that = this;

        Ext.Array.each(records, function(feature) {
        
		var STeamGoal = {'Yes' : 20,
						 'No'  : 0};

		var CostSavings = {'> $500,000'          : 4,
					 	   '$100,000 - $500,000' : 3,
						   '$60,000 - $100,000'  : 2,
						   '$20,000 - $60,000'   : 1,
						   '< $20,000'           : 0};
		
		var DefectReduction = {'> 5,000 Defects'       : 4,
					 	       '3,000 - 5,000 Defects' : 3,
						       '2,000 - 3,000 Defects' : 2,
						       '< 2,000 Defects'       : 1,
						       'No Impact'             : 0};
		
		var BusinessExpansion = {'> 10,000'      : 4,
				 	 	        '5,000 - 10,000' : 3,
						        '1,000 - 5,000'  : 2,
						        '< 1,000'        : 1,
						        'No Impact'      : 0};
		
		var CurrentWorkaround = {'No'      : 4,
						         'Yes'     : 1};
		
		var Legal = {'Yes' : 4,
					 'No'  : 0};
		
		var EmploySelfSufficiency = {'Direct: > 5,000 Employees'   : 4,
					 	             'Direct: < 5,000 Employees'   : 3,
						             'Indirect: > 5,000 Employees' : 2,
						             'Indirect: < 5,000 Employees' : 1,
						             'No Impact'                   : 0};
		
		var ESTech = {'Yes' : 4,
					  'No'  : 1};
					  
		var STeamGoalVal = 0;
		var STeamGoalEntry = feature.data[that.STeamGoalField];
		if (STeamGoalEntry !== "") {
			STeamGoalVal = STeamGoalEntry in STeamGoal ? STeamGoal[STeamGoalEntry] : 10000;
		}

		var CostSavingsVal = 0;
		var CostSavingsEntry = feature.data[that.CostSavingsField];
		if (CostSavingsEntry !== "") {
			CostSavingsVal = CostSavingsEntry in CostSavings ? CostSavings[CostSavingsEntry] : 10000;
		}
		            
		var DefectReductionVal = 0;
		var DefectReductionEntry = feature.data[that.DefectReductionField];
		if (DefectReductionEntry !== "") {
			DefectReductionVal = DefectReductionEntry in DefectReduction ? DefectReduction[DefectReductionEntry] : 10000;
		}

		var BusinessExpansionVal = 0;
		var BusinessExpansionEntry = feature.data[that.BusinessExpansionField];
		if (BusinessExpansionEntry !== "") {
			BusinessExpansionVal = BusinessExpansionEntry in BusinessExpansion ? BusinessExpansion[BusinessExpansionEntry] : 10000;
		}

		var CurrentWorkaroundVal = 0;
		var CurrentWorkaroundEntry = feature.data[that.CurrentWorkaroundField];
		if (CurrentWorkaroundEntry !== "") {
			CurrentWorkaroundVal = CurrentWorkaroundEntry in CurrentWorkaround ? CurrentWorkaround[CurrentWorkaroundEntry] : 10000;
		}
		            
		var LegalVal = 0;
		var LegalEntry = feature.data[that.LegalCField];
		if (LegalEntry !== "") {
			LegalVal = LegalEntry in Legal ? Legal[LegalEntry] : 10000;
		}
		            
		var EmploySelfSufficiencyVal = 0;
		var EmploySelfSufficiencyEntry = feature.data[that.EmployeeSelfSufficiencyField];
		if (EmploySelfSufficiencyEntry !== "") {
			EmploySelfSufficiencyVal = EmploySelfSufficiencyEntry in EmploySelfSufficiency ? EmploySelfSufficiency[EmploySelfSufficiencyEntry] : 10000;
		}
		            
		var ESTechVal = 0;
		var ESTechEntry = feature.data[that.ESTechField];
		if (ESTechEntry !== "") {
			ESTechVal = ESTechEntry in ESTech ? ESTech[ESTechEntry] : 10000;
		}
		            
		var score = STeamGoalVal + 
					CostSavingsVal + 
					DefectReductionVal + 
					BusinessExpansionVal + 
					CurrentWorkaroundVal + 
					LegalVal + 
					EmploySelfSufficiencyVal + 
					ESTechVal;
					
					
	  //  var oldScore  = feature.data[that.PriorityScoreField];
	  //  oldScore = _.isUndefined(oldScore) || _.isNull(oldScore) ? 0 : oldScore;
	    
	  //  console.log("OldScore = " + oldScore);
	    console.log("Score = " + score);
	    console.log("Loading = " + loading);
	    
     //   if (oldScore !== score) { // only update if score changed
            feature.set(that.PriorityScoreField, score);
            console.log("Feature Set : " + feature.data['FormattedID']);
            if( loading ) {
                // This ensures that if this is the first time this item
                // is loaded into the grid, the calculation will be 
                // saved in the db.
                feature.save();
                console.log("Feature Saved : " + feature.data['FormattedID']);
            }
     //   }
        });
    },
    
    getSettingsFields: function() {
        var values = [
            {
                name: 'STeamGoalField',
                xtype: 'rallytextfield',
                label : "S-Team Goal",
                labelWidth: 200
            },
            {
                name: 'CostSavingsField',
                xtype: 'rallytextfield',
                label : "Cost Savings",
                labelWidth: 200
            },
            {
                name: 'DefectReductionField',
                xtype: 'rallytextfield',
                label : "Defect Reduction",
                labelWidth: 200
            },
            {
                name: 'BusinessExpansionField',
                xtype: 'rallytextfield',
                label : "Business Expansion",
                labelWidth: 200
            },
            {
                name: 'CurrentWorkaroundField',
                xtype: 'rallytextfield',
                label : "Current Work-Around",
                labelWidth: 200
            },
            {
                name: 'LegalCField',
                xtype: 'rallytextfield',
                label : "Legal / Payroll etc.",
                labelWidth: 200
            },
            {
                name: 'EmployeeSelfSufficiencyField',
                xtype: 'rallytextfield',
                label : "Employee Self Sufficiency",
                labelWidth: 200
            },
            {
                name: 'ESTechField',
                xtype: 'rallytextfield',
                label : "ES Tech Investment",
                labelWidth: 200
            },
            {
                name: 'PriorityScoreField',
                xtype: 'rallytextfield',
                label : "Priority Score Result",
                labelWidth: 200
            }
        ];

        return values;
    },

    config: {
        defaultSettings : {
            STeamGoalField : 'c_STeamGoal',
            CostSavingsField : 'c_CostSavings',
            DefectReductionField : 'c_DefectReduction',
            BusinessExpansionField : 'c_BusinessExpansion',
            CurrentWorkaroundField : 'c_CurrentWorkaround',
            LegalCField : 'c_LegalC',
            EmployeeSelfSufficiencyField : 'c_EmployeeSelfSufficiency',
            ESTechField : 'c_ESTech',
            PriorityScoreField : 'c_PriorityScore'
        }
    }
});
