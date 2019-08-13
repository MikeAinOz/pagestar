/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

"use strict";
import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import { VisualSettings } from "./settings";
    export class Visual implements IVisual {
        private target: HTMLElement;
        private settings: VisualSettings;
        private urlNode: Text;
        private targetUrl: string;

        constructor(options: VisualConstructorOptions) {
            console.log('Visual constructor', options);
            this.target = options.element;
            this.targetUrl = "url not set"
            if (typeof document !== "undefined") {
                // hidden url
                const new_ph = document.createElement("p");
                new_ph.setAttribute('id',"hidden_url");
                new_ph.setAttribute('class',"hidden_url)");
                new_ph.hidden = true;
                
                this.urlNode = document.createTextNode(this.targetUrl);
                new_ph.appendChild(this.urlNode);
                this.target.appendChild(new_ph);
                //
                const new_f: HTMLElement = document.createElement("div");
                
                new_f.appendChild(starability());
                var new_b = document.createElement("input");
                new_b.setAttribute('type', "submit");
                new_b.setAttribute('value', "Rate");
                new_b.setAttribute('id',"bUpdate");
                
                new_b.onclick = function () {
                       var val = getRadioVal(new_f);
                       btnClick(val);                       
                }
                new_f.appendChild(new_b);
                this.target.appendChild(new_f);
                const new_pm = document.createElement("p");
                new_pm.setAttribute('id',"final_msg");
                new_pm.hidden = true;
                var new_message = document.createTextNode("Rating Received");
                new_pm.appendChild(new_message);
                this.target.appendChild(new_pm);
            }
            function starability(){
                var titles=[ "Unacceptable",
                        "Deficient",
                        "Mediocre",
                        "Copacetic",
                        "Outstanding"];
                var fieldset = document.createElement("div");
                fieldset.setAttribute("class","starability-basic");
                var legend = document.createElement("legend");
                var legendtext = document.createTextNode("Rate This Page");
                legend.appendChild(legendtext);
                fieldset.appendChild(legend);
                var rb = document.createElement("input");
                rb.setAttribute('type',"radio");
                rb.setAttribute('id', "no-rate");
                rb.setAttribute('class',"input-no-rate" );
                rb.setAttribute('name',"rating");
                rb.setAttribute('value',"0");
                rb.checked = true;
                rb.setAttribute ('aria-label',"No rating.");
                fieldset.appendChild(rb);
                for (var i in titles) {
                    var j = parseInt(i) + 1;
                    var rb = document.createElement("input");
                    rb.setAttribute('type',"radio");
                    rb.setAttribute('id', "rate" + j);
                    rb.setAttribute('name',"rating");
                    rb.setAttribute('value',j.toString());
                    fieldset.appendChild(rb);
                    var lb = document.createElement("label");
                    lb.setAttribute('for',"rate" + j);
                    lb.setAttribute('title',titles[i]);
                    lb.setAttribute('value',"Star " + j);
                    fieldset.appendChild(lb);
                }
                return fieldset;
            }
            function getRadioVal(form) {
                var val;
                // get list of radio buttons 
                var radios = form.getElementsByTagName("input");                
                // loop through list of radio buttons
                for (var i=0, len=radios.length; i<len; i++) {
                    if ( radios[i].checked ) { // radio checked?
                        val = radios[i].value; // if so, hold its value in val
                        break; // and break out of for loop
                    }
                }
                return val; // return value of checked radio or undefined if none checked
            } 

            function btnClick(val){
                console.log('btnClick');  
                var datanode = document.getElementById("hidden_url");               
                var userName = datanode.dataset.userName ;
                var pageName = datanode.dataset.pageName ;
                var obj =    { pageName: pageName, userName : userName , value : val   };  
                var sendData = JSON.stringify(obj);              
                var postUrl = datanode.dataset.url;

                $.ajax({
                    url: postUrl,
                    type:"POST",
                    data: sendData,
                    contentType:"application/json; charset=utf-8",
                    dataType:"json",
                    success: function(data){                                    
                        $('#final_msg').fadeIn(); ;                      
                        setTimeout(function() {
                            $('#final_msg').fadeOut();
                           }, 10000 )
                        },                
                    error: function( jqXhr, textStatus, errorThrown ){
                        console.log( errorThrown );
                    }                   
                 });
                                              
            }
        }

        public update(options: VisualUpdateOptions) {
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            
            //console.log('Update settings', this.settings);
            let dataViews = options.dataViews;
            let userName = dataViews[0].single.value;            
            let datanode = document.getElementById("hidden_url");
            
            datanode.dataset.url = this.settings.url.targetUrl;
            datanode.dataset.pageName = this.settings.page.pageName;
            datanode.dataset.userName = String(userName);
            
            this.urlNode.textContent = this.settings.url.targetUrl;
           
            var norate : HTMLInputElement = document.getElementById("no-rate") as HTMLInputElement;
            norate.checked = true;  
            //console.log('Update Completed');         
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }
    }
    