///<reference path="./typings/main.d.ts" />
import tl = require("vsts-task-lib/task");

let msbuildAdditionalArguments: string[] = new Array<string>();
const variableName = tl.getInput("variableName", true);

// ensure we don't override already set values
const existingArguments = tl.getVariable(variableName);
if (existingArguments) {
    msbuildAdditionalArguments.push(existingArguments);
}

// MSBUILD
const outputPath = tl.getInput("MsBuildOutputPath", false);
if (outputPath && outputPath !== "AsConfigured") {
    let path: string;
    switch (outputPath) {
        case "BinariesDirectory":
            path = tl.getVariable("Build.BinariesDirectory");
            break;

        case "StagingDirectory":
            path = tl.getVariable("Build.StagingDirectory");
            break;

        case "Custom":
            path = tl.getInput("MsBuildCustomBaseOutputPath", true);
            break;
    }

    msbuildAdditionalArguments.push(`/p:OutputPath=${path}`);
}

const baseOutputPath = tl.getInput("MsBuildBaseOutputPath", false);
if (baseOutputPath && baseOutputPath !== "AsConfigured") {
    let path: string;
    switch (baseOutputPath) {
        case "BinariesDirectory":
            path = tl.getVariable("Build.BinariesDirectory");
            break;

        case "StagingDirectory":
            path = tl.getVariable("Build.StagingDirectory");
            break;

        case "Custom":
            path = tl.getPathInput("MsBuildCustomBaseOutputPath", true);
            break;
    }

    msbuildAdditionalArguments.push(`/p:BaseOutputPath=${path}`);
}

const treatWarningsAsErrors = tl.getInput("MsBuildTreatWarningsAsErrors", false);
if (treatWarningsAsErrors && treatWarningsAsErrors !== "AsConfigured") {
    msbuildAdditionalArguments.push(`/p:TreatWarningsAsErrors=${treatWarningsAsErrors}`);
}

const buildInParallel = tl.getInput("MsBuildBuildInParallel", false);
if (buildInParallel && buildInParallel !== "AsConfigured") {
    msbuildAdditionalArguments.push(`/p:BuildInParallel=${treatWarningsAsErrors}`);
}

const maxCpuCount = +tl.getInput("MsBuildMaxCpuCount", false);
if (buildInParallel) {
    msbuildAdditionalArguments.push(`/m:${maxCpuCount}`);
}

// CODE ANALYSIS
const runCodeAnalysis = tl.getInput("RunCodeAnalysis", false);
if (runCodeAnalysis && runCodeAnalysis !== "AsConfigured") {
    msbuildAdditionalArguments.push(`/p:RunCodeAnalysis=${runCodeAnalysis}`);
}

const codeAnalysisRuleset = tl.getInput("CodeAnalysisRuleset", false);
if (codeAnalysisRuleset && codeAnalysisRuleset !== "AsConfigured") {
    if (codeAnalysisRuleset !== "Custom") {
        msbuildAdditionalArguments.push(`/p:CodeAnalysisRuleset=${codeAnalysisRuleset}.ruleset`);
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
if (validateArchitecture && validateArchitecture !== "AsConfigured") {
    msbuildAdditionalArguments.push(`/p:ValidateArchitecture=${validateArchitecture}`);
}

tl.setVariable(variableName, msbuildAdditionalArguments.join(" "));