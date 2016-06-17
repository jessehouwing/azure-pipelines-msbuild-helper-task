"use strict";
///<reference path="./typings/main.d.ts" />
var tl = require("vsts-task-lib/task");
var msbuildAdditionalArguments;
var variableName = tl.getInput("variableName", true);
// CODE ANALYSIS
var runCodeAnalysis = tl.getInput("RunCodeAnalysis", false);
if (runCodeAnalysis !== "") {
    msbuildAdditionalArguments.push("/p:RunCodeAnalysis=" + runCodeAnalysis);
}
var codeAnalysisRuleset = tl.getInput("CodeAnalysisRuleset", false);
if (codeAnalysisRuleset !== "") {
    if (codeAnalysisRuleset !== "Custom") {
        msbuildAdditionalArguments.push("/p:CodeAnalysisRuleset=" + codeAnalysisRuleset);
    }
    else {
        var customCodeAnalysisRuleset = tl.getPathInput("CustomCodeAnalysisRuleset", true);
        msbuildAdditionalArguments.push("/p:CodeAnalysisRuleset=" + customCodeAnalysisRuleset);
    }
}
var codeAnalysisTreatWarningsAsErrors = tl.getBoolInput("CodeAnalysisTreatWarningsAsErrors", false);
if (codeAnalysisTreatWarningsAsErrors) {
    msbuildAdditionalArguments.push("/p:CodeAnalysisTreatWarningsAsErrors=" + codeAnalysisTreatWarningsAsErrors);
}
var codeAnalysisAdditionalArguments = tl.getInput("CodeAnalysisAdditionalArguments", false);
if (codeAnalysisAdditionalArguments) {
    msbuildAdditionalArguments.push(codeAnalysisAdditionalArguments);
}
// LAYER VALIDATION
var validateArchitecture = tl.getInput("ValidateArchitecture", false);
if (validateArchitecture !== "") {
    msbuildAdditionalArguments.push("/p:ValidateArchitecture=" + validateArchitecture);
}
tl.setVariable(variableName, msbuildAdditionalArguments.join(" "));
