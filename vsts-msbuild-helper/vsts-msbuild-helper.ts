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
let msbuildTargets: string[] = new Array<string>();
if (tl.getBoolInput("MsBuildTargetClean")) {
    msbuildTargets.push("Clean");
}
if (tl.getBoolInput("MsBuildTargetBuild")) {
    msbuildTargets.push("Build");
}
const customMsBuildTargets: string[] = tl.getDelimitedInput("MsBuildTargetCustom", ";", false);
msbuildTargets.push(...customMsBuildTargets);

if (msbuildTargets.length > 0) {
    msbuildAdditionalArguments.push(`/t:${msbuildTargets.join(";")}`);
}

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
            path = tl.getInput("MsBuildCustomOutputPath", true);
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

const generateDocumentation = tl.getInput("GenerateDocumentation", false);
if (generateDocumentation && generateDocumentation !== "AsConfigured") {
    msbuildAdditionalArguments.push(`/p:GenerateDocumentation=${generateDocumentation}`);
}

const skipInvalidConfigurations = tl.getInput("SkipInvalidConfigurations", false);
if (skipInvalidConfigurations && skipInvalidConfigurations !== "AsConfigured") {
    msbuildAdditionalArguments.push(`/p:skipInvalidConfigurations=${skipInvalidConfigurations}`);
}


const buildInParallel = tl.getInput("MsBuildBuildInParallel", false);
if (buildInParallel && buildInParallel !== "AsConfigured") {
    msbuildAdditionalArguments.push(`/p:BuildInParallel=${buildInParallel}`);
}

const maxCpuCount = tl.getInput("MsBuildMaxCpuCount", false);
if (maxCpuCount) {
    msbuildAdditionalArguments.push(`/m:${maxCpuCount}`);
}

if (tl.filePathSupplied("CustomAfterMicrosoftCommonTargets")) {
    const customAfterMicrosoftCommonTargets = tl.getPathInput("CustomAfterMicrosoftCommonTargets", false);
    if (customAfterMicrosoftCommonTargets) {
        msbuildAdditionalArguments.push(`/p:CustomAfterMicrosoftCommonTargets=${customAfterMicrosoftCommonTargets}`);
    }
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
        const customCodeAnalysisRuleset = tl.getPathInput("CodeAnalysisCustomRuleset", true);
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

// ASPNET
const mvcBuildViews = tl.getInput("MvcBuildViews", false);
if (mvcBuildViews && mvcBuildViews !== "AsConfigured") {
    msbuildAdditionalArguments.push(`/p:MvcBuildViews=${mvcBuildViews}`);
}

const aspnetPrecompile = tl.getInput("Precompile", false);
if (aspnetPrecompile && aspnetPrecompile !== "AsConfigured") {
    if (aspnetPrecompile) {
        msbuildAdditionalArguments.push(`/t:AspNetPreCompile`);
    }
    msbuildAdditionalArguments.push(`/p:AspNetCompileMerge=${aspnetPrecompile}`);
}

const enableUpdateable = tl.getInput("EnableUpdateable", false);
if (enableUpdateable && enableUpdateable !== "AsConfigured") {
    msbuildAdditionalArguments.push(`/p:EnableUpdateable=${enableUpdateable}`);
}

// DEPLOY

const deployOnBuild = tl.getInput("DeployOnBuild", false);
if (deployOnBuild && deployOnBuild !== "AsConfigured") {
    msbuildAdditionalArguments.push(`/p:DeployOnBuild=${deployOnBuild}`);
}

const packageLocation = tl.getInput("PackageLocation", false);
if (packageLocation && packageLocation !== "AsConfigured") {
    let path: string;
    switch (packageLocation) {
        case "BinariesDirectory":
            path = tl.getVariable("Build.BinariesDirectory");
            break;

        case "StagingDirectory":
            path = tl.getVariable("Build.StagingDirectory");
            break;

        case "Custom":
            path = tl.getPathInput("CustomPackageLocation", true);
            break;
    }

    msbuildAdditionalArguments.push(`/p:PackageLocation=${path}`);
}

tl.setVariable(variableName, msbuildAdditionalArguments.join(" "));