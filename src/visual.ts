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
import * as $ from "jquery";
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
    static targetUrl: string;
    static pageName: string;
    static userName: string;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.target = options.element;
        if (typeof document !== "undefined") {
            const new_f: HTMLElement = document.createElement("div");
            new_f.appendChild(starability());
            var new_b = document.createElement("input");
            new_b.setAttribute('type', "submit");
            new_b.setAttribute('value', "Rate");
            new_b.setAttribute('id', "bUpdate");

            new_b.onclick = function () {
                var val = getRadioVal(new_f);
                btnClick(val);
            }
            new_f.appendChild(new_b);
            this.target.appendChild(new_f);
            const new_pm = document.createElement("p");
            new_pm.setAttribute('id', "final_msg");
            new_pm.hidden = true;
            var new_message = document.createTextNode("Page Rating Received");
            new_pm.appendChild(new_message);
            this.target.appendChild(new_pm);
        }
        function starability() {
            var titles = ["Unacceptable",
                "Deficient",
                "Mediocre",
                "Copacetic",
                "Outstanding"];
            var fieldset = document.createElement("div");
            fieldset.setAttribute("class", "starability-basic");
            var legend = document.createElement("legend");
            var legendtext = document.createTextNode("Rate This Page");
            legend.appendChild(legendtext);
            fieldset.appendChild(legend);
            var rb = document.createElement("input");
            rb.setAttribute('type', "radio");
            rb.setAttribute('id', "no-rate");
            rb.setAttribute('class', "input-no-rate");
            rb.setAttribute('name', "rating");
            rb.setAttribute('value', "0");
            rb.checked = true;
            rb.setAttribute('aria-label', "No rating.");
            fieldset.appendChild(rb);
            for (var i in titles) {
                var j = parseInt(i) + 1;
                var rb = document.createElement("input");
                rb.setAttribute('type', "radio");
                rb.setAttribute('id', "rate" + j);
                rb.setAttribute('name', "rating");
                rb.setAttribute('value', j.toString());
                fieldset.appendChild(rb);
                var lb = document.createElement("label");
                lb.setAttribute('for', "rate" + j);
                lb.setAttribute('title', titles[i]);
                lb.setAttribute('value', "Star " + j);
                fieldset.appendChild(lb);
            }
            return fieldset;
        }
        function getRadioVal(form) {
            let val: string = "";
            // get list of radio buttons 
            let radios = form.getElementsByTagName("input");
            // loop through list of radio buttons
            for (var i = 0, len = radios.length; i < len; i++) {
                if (radios[i].checked) { // radio checked?
                    val = radios[i].value; // if so, hold its value in val
                    break; // and break out of for loop
                }
            }
            return val; // return value of checked radio or undefined if none checked
        }

        function btnClick(val) {
            console.log('btnClick');
            let obj = { pageName: Visual.pageName, userName: Visual.userName, value: val };
            let sendData = JSON.stringify(obj);
            $.ajax({
                url: Visual.targetUrl,
                type: "POST",
                data: sendData,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    $('#final_msg').fadeIn();;
                    setTimeout(function () {
                        $('#final_msg').fadeOut();
                    }, 10000)
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            });

        }
    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

        //console.log('Update settings', this.settings);
        let dataViews = options.dataViews;
        Visual.userName = String(dataViews[0].single.value);
        Visual.targetUrl = this.settings.url.targetUrl;
        Visual.pageName = this.settings.page.pageName;
        let norate: HTMLInputElement = document.getElementById("no-rate") as HTMLInputElement;
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
