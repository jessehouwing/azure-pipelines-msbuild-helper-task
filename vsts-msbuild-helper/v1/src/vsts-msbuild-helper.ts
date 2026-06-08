import * as tl from 'azure-pipelines-task-lib/task';

export function run(): void {
  const msbuildAdditionalArguments: string[] = [];
  const variableName = tl.getInput('variableName', true);
  if (!variableName) return;

  // Preserve already-set values
  const existingArguments = tl.getVariable(variableName);
  if (existingArguments) {
    msbuildAdditionalArguments.push(existingArguments);
  }

  // MSBUILD targets
  const msbuildTargets: string[] = [];
  if (tl.getBoolInput('MsBuildTargetClean')) {
    msbuildTargets.push('Clean');
  }
  if (tl.getBoolInput('MsBuildTargetBuild')) {
    msbuildTargets.push('Build');
  }
  const customMsBuildTargets = tl.getDelimitedInput('MsBuildTargetCustom', ';', false);
  msbuildTargets.push(...customMsBuildTargets);

  if (msbuildTargets.length > 0) {
    msbuildAdditionalArguments.push(`/t:${msbuildTargets.join(';')}`);
  }

  // Output path
  const outputPath = tl.getInput('MsBuildOutputPath', false);
  if (outputPath && outputPath !== 'AsConfigured') {
    let resolvedPath = '';
    switch (outputPath) {
      case 'BinariesDirectory':
        resolvedPath = `"${tl.getVariable('Build.BinariesDirectory') ?? ''}"`;
        break;
      case 'StagingDirectory':
        resolvedPath = `"${tl.getVariable('Build.StagingDirectory') ?? ''}"`;
        break;
      case 'Custom':
        resolvedPath = tl.getInput('MsBuildCustomOutputPath', true) ?? '';
        break;
    }
    if (resolvedPath) {
      msbuildAdditionalArguments.push(`/p:OutputPath=${resolvedPath}`);
    }
  }

  // Base output path
  const baseOutputPath = tl.getInput('MsBuildBaseOutputPath', false);
  if (baseOutputPath && baseOutputPath !== 'AsConfigured') {
    let resolvedPath = '';
    switch (baseOutputPath) {
      case 'BinariesDirectory':
        resolvedPath = `"${tl.getVariable('Build.BinariesDirectory') ?? ''}"`;
        break;
      case 'StagingDirectory':
        resolvedPath = `"${tl.getVariable('Build.StagingDirectory') ?? ''}"`;
        break;
      case 'Custom':
        resolvedPath = tl.getPathInput('MsBuildCustomBaseOutputPath', true) ?? '';
        break;
    }
    if (resolvedPath) {
      msbuildAdditionalArguments.push(`/p:BaseOutputPath=${resolvedPath}`);
    }
  }

  // Treat warnings as errors
  const treatWarningsAsErrors = tl.getInput('MsBuildTreatWarningsAsErrors', false);
  if (treatWarningsAsErrors && treatWarningsAsErrors !== 'AsConfigured') {
    msbuildAdditionalArguments.push(`/p:TreatWarningsAsErrors=${treatWarningsAsErrors}`);
  }

  // Generate documentation
  const generateDocumentation = tl.getInput('GenerateDocumentation', false);
  if (generateDocumentation && generateDocumentation !== 'AsConfigured') {
    msbuildAdditionalArguments.push(`/p:GenerateDocumentation=${generateDocumentation}`);
  }

  // Skip invalid configurations
  const skipInvalidConfigurations = tl.getInput('SkipInvalidConfigurations', false);
  if (skipInvalidConfigurations && skipInvalidConfigurations !== 'AsConfigured') {
    msbuildAdditionalArguments.push(`/p:skipInvalidConfigurations=${skipInvalidConfigurations}`);
  }

  // Build in parallel
  const buildInParallel = tl.getInput('MsBuildBuildInParallel', false);
  if (buildInParallel && buildInParallel !== 'AsConfigured') {
    msbuildAdditionalArguments.push(`/p:BuildInParallel=${buildInParallel}`);
  }

  // Max CPU count
  const maxCpuCount = tl.getInput('MsBuildMaxCpuCount', false);
  if (maxCpuCount) {
    msbuildAdditionalArguments.push(`/m:${maxCpuCount}`);
  }

  // Custom after Microsoft common targets
  if (tl.filePathSupplied('CustomAfterMicrosoftCommonTargets')) {
    const customAfterMicrosoftCommonTargets = tl.getPathInput('CustomAfterMicrosoftCommonTargets', false);
    if (customAfterMicrosoftCommonTargets) {
      msbuildAdditionalArguments.push(`/p:CustomAfterMicrosoftCommonTargets=${customAfterMicrosoftCommonTargets}`);
    }
  }

  // CODE ANALYSIS
  const runCodeAnalysis = tl.getInput('RunCodeAnalysis', false);
  if (runCodeAnalysis && runCodeAnalysis !== 'AsConfigured') {
    msbuildAdditionalArguments.push(`/p:RunCodeAnalysis=${runCodeAnalysis}`);
  }

  const codeAnalysisRuleset = tl.getInput('CodeAnalysisRuleset', false);
  if (codeAnalysisRuleset && codeAnalysisRuleset !== 'AsConfigured') {
    if (codeAnalysisRuleset !== 'Custom') {
      msbuildAdditionalArguments.push(`/p:CodeAnalysisRuleset=${codeAnalysisRuleset}.ruleset`);
    } else {
      const customCodeAnalysisRuleset = tl.getPathInput('CodeAnalysisCustomRuleset', true);
      if (customCodeAnalysisRuleset) {
        msbuildAdditionalArguments.push(`/p:CodeAnalysisRuleset=${customCodeAnalysisRuleset}`);
      }
    }
  }

  const codeAnalysisTreatWarningsAsErrors = tl.getBoolInput('CodeAnalysisTreatWarningsAsErrors', false);
  if (codeAnalysisTreatWarningsAsErrors) {
    msbuildAdditionalArguments.push(`/p:CodeAnalysisTreatWarningsAsErrors=${String(codeAnalysisTreatWarningsAsErrors)}`);
  }

  const codeAnalysisAdditionalArguments = tl.getInput('CodeAnalysisAdditionalArguments', false);
  if (codeAnalysisAdditionalArguments) {
    msbuildAdditionalArguments.push(codeAnalysisAdditionalArguments);
  }

  // LAYER VALIDATION
  const validateArchitecture = tl.getInput('ValidateArchitecture', false);
  if (validateArchitecture && validateArchitecture !== 'AsConfigured') {
    msbuildAdditionalArguments.push(`/p:ValidateArchitecture=${validateArchitecture}`);
  }

  // ASPNET
  const mvcBuildViews = tl.getInput('MvcBuildViews', false);
  if (mvcBuildViews && mvcBuildViews !== 'AsConfigured') {
    msbuildAdditionalArguments.push(`/p:MvcBuildViews=${mvcBuildViews}`);
  }

  const aspnetPrecompile = tl.getInput('Precompile', false);
  if (aspnetPrecompile && aspnetPrecompile !== 'AsConfigured') {
    msbuildAdditionalArguments.push(`/t:AspNetPreCompile`);
    msbuildAdditionalArguments.push(`/p:AspNetCompileMerge=${aspnetPrecompile}`);
  }

  const enableUpdateable = tl.getInput('EnableUpdateable', false);
  if (enableUpdateable && enableUpdateable !== 'AsConfigured') {
    msbuildAdditionalArguments.push(`/p:EnableUpdateable=${enableUpdateable}`);
  }

  // DEPLOY
  const deployOnBuild = tl.getInput('DeployOnBuild', false);
  if (deployOnBuild && deployOnBuild !== 'AsConfigured') {
    msbuildAdditionalArguments.push(`/p:DeployOnBuild=${deployOnBuild}`);
  }

  const packageLocation = tl.getInput('PackageLocation', false);
  if (packageLocation && packageLocation !== 'AsConfigured') {
    let resolvedPath = '';
    switch (packageLocation) {
      case 'BinariesDirectory':
        resolvedPath = `"${tl.getVariable('Build.BinariesDirectory') ?? ''}"`;
        break;
      case 'StagingDirectory':
        resolvedPath = `"${tl.getVariable('Build.StagingDirectory') ?? ''}"`;
        break;
      case 'Custom':
        resolvedPath = tl.getPathInput('CustomPackageLocation', true) ?? '';
        break;
    }
    if (resolvedPath) {
      msbuildAdditionalArguments.push(`/p:PackageLocation=${resolvedPath}`);
    }
  }

  tl.setVariable(variableName, msbuildAdditionalArguments.join(' '));
}

/* v8 ignore next 3 */
if (require.main === module) {
  run();
}
