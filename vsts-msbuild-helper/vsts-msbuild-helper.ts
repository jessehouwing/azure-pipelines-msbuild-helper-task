///<reference path="./typings/main.d.ts" />
import tl = require("vsts-task-lib/task");

let msbuildAdditionalArguments: string[];
const variableName = tl.getInput("variableName", true);

// CODE ANALYSIS
const runCodeAnalysis = tl.getInput("RunCodeAnalysis", false);
if (runCodeAnalysis !== "") {
    msbuildAdditionalArguments.push(`/p:RunCodeAnalysis=${runCodeAnalysis}`);
}

const codeAnalysisRuleset = tl.getInput("CodeAnalysisRuleset", false);
if (codeAnalysisRuleset !== "") {
    if (codeAnalysisRuleset !== "Custom") {
        msbuildAdditionalArguments.push(`/p:CodeAnalysisRuleset=${codeAnalysisRuleset}`);
    } else {
        const customCodeAnalysisRuleset = tl.getPathInput("CustomCodeAnalysisRuleset", true);
        msbuildAdditionalArguments.push(`/p:CodeAnalysisRuleset=${customCodeAnalysisRuleset}`);
    }
}

const codeAnalysisTreatWarningsAsErrors = tl.getBoolInput("CodeAnalysisTreatWarningsAsErrors", false);
if (codeAnalysisTreatWarningsAsErrors) {
    msbuildAdditionalArguments.push(`/p:CodeAnalysisTreatWarningsAsErrors=${codeAnalysisTreatWarningsAsErrors}`);
}

const codeAnalysisAdditionalArguments = tl.getInput("CodeAnalysisAdditionalArguments", false);
if (codeAnalysisAdditionalArguments) {
    msbuildAdditionalArguments.push(codeAnalysisAdditionalArguments);
}



// LAYER VALIDATION
const validateArchitecture = tl.getInput("ValidateArchitecture", false);
if (validateArchitecture !== "") {
    msbuildAdditionalArguments.push(`/p:ValidateArchitecture=${validateArchitecture}`);
}

tl.setVariable(variableName, msbuildAdditionalArguments.join(" "));