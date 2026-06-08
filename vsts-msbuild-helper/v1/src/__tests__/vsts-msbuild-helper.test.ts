import * as tl from 'azure-pipelines-task-lib/task';
import { run } from '../vsts-msbuild-helper';

jest.mock('azure-pipelines-task-lib/task');

const tlMock = tl as jest.Mocked<typeof tl>;

describe('MsBuildHelperTask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tlMock.getInput.mockReturnValue(null as unknown as string);
    tlMock.getBoolInput.mockReturnValue(false);
    tlMock.getVariable.mockReturnValue(undefined);
    tlMock.getDelimitedInput.mockReturnValue([]);
    tlMock.getPathInput.mockReturnValue(null as unknown as string);
    tlMock.filePathSupplied.mockReturnValue(false);
  });

  describe('variableName', () => {
    it('should return early when variableName is not provided', () => {
      tlMock.getInput.mockReturnValue(null as unknown as string);
      run();
      expect(tlMock.setVariable).not.toHaveBeenCalled();
    });

    it('should set empty string when no options are configured', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '');
    });

    it('should preserve existing variable value', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        return null as unknown as string;
      });
      tlMock.getVariable.mockReturnValue('/p:ExistingProp=true');
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:ExistingProp=true');
    });
  });

  describe('MsBuild targets', () => {
    beforeEach(() => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        return null as unknown as string;
      });
    });

    it('should add Clean target', () => {
      tlMock.getBoolInput.mockImplementation((name) => name === 'MsBuildTargetClean');
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/t:Clean');
    });

    it('should add Build target', () => {
      tlMock.getBoolInput.mockImplementation((name) => name === 'MsBuildTargetBuild');
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/t:Build');
    });

    it('should combine Clean and Build targets', () => {
      tlMock.getBoolInput.mockImplementation(
        (name) => name === 'MsBuildTargetClean' || name === 'MsBuildTargetBuild',
      );
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/t:Clean;Build');
    });

    it('should add custom targets', () => {
      tlMock.getDelimitedInput.mockImplementation((name) => {
        if (name === 'MsBuildTargetCustom') return ['Publish', 'Pack'];
        return [];
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/t:Publish;Pack');
    });

    it('should combine standard and custom targets', () => {
      tlMock.getBoolInput.mockImplementation((name) => name === 'MsBuildTargetBuild');
      tlMock.getDelimitedInput.mockImplementation((name) => {
        if (name === 'MsBuildTargetCustom') return ['Publish'];
        return [];
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/t:Build;Publish');
    });
  });

  describe('Output paths', () => {
    beforeEach(() => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        return null as unknown as string;
      });
    });

    it('should skip output path when AsConfigured', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'MsBuildOutputPath') return 'AsConfigured';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '');
    });

    it('should set output path to BinariesDirectory', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'MsBuildOutputPath') return 'BinariesDirectory';
        return null as unknown as string;
      });
      tlMock.getVariable.mockImplementation((name) => {
        if (name === 'Build.BinariesDirectory') return 'C:\\build\\bin';
        return undefined;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:OutputPath="C:\\build\\bin"');
    });

    it('should set output path to StagingDirectory', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'MsBuildOutputPath') return 'StagingDirectory';
        return null as unknown as string;
      });
      tlMock.getVariable.mockImplementation((name) => {
        if (name === 'Build.StagingDirectory') return 'C:\\build\\staging';
        return undefined;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:OutputPath="C:\\build\\staging"');
    });

    it('should set custom output path', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'MsBuildOutputPath') return 'Custom';
        if (name === 'MsBuildCustomOutputPath') return 'C:\\custom\\output';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:OutputPath=C:\\custom\\output');
    });

    it('should set base output path to BinariesDirectory', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'MsBuildBaseOutputPath') return 'BinariesDirectory';
        return null as unknown as string;
      });
      tlMock.getVariable.mockImplementation((name) => {
        if (name === 'Build.BinariesDirectory') return 'C:\\build\\bin';
        return undefined;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:BaseOutputPath="C:\\build\\bin"');
    });

    it('should set custom base output path', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'MsBuildBaseOutputPath') return 'Custom';
        return null as unknown as string;
      });
      tlMock.getPathInput.mockImplementation((name) => {
        if (name === 'MsBuildCustomBaseOutputPath') return 'C:\\custom\\base';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:BaseOutputPath=C:\\custom\\base');
    });
  });

  describe('MsBuild options', () => {
    beforeEach(() => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        return null as unknown as string;
      });
    });

    it('should set TreatWarningsAsErrors', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'MsBuildTreatWarningsAsErrors') return 'true';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:TreatWarningsAsErrors=true');
    });

    it('should skip TreatWarningsAsErrors when AsConfigured', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'MsBuildTreatWarningsAsErrors') return 'AsConfigured';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '');
    });

    it('should set GenerateDocumentation', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'GenerateDocumentation') return 'true';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:GenerateDocumentation=true');
    });

    it('should set BuildInParallel', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'MsBuildBuildInParallel') return 'true';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:BuildInParallel=true');
    });

    it('should set MaxCpuCount', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'MsBuildMaxCpuCount') return '4';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/m:4');
    });

    it('should set CustomAfterMicrosoftCommonTargets', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        return null as unknown as string;
      });
      tlMock.filePathSupplied.mockImplementation((name) => name === 'CustomAfterMicrosoftCommonTargets');
      tlMock.getPathInput.mockImplementation((name) => {
        if (name === 'CustomAfterMicrosoftCommonTargets') return 'C:\\custom.targets';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith(
        'MsBuildArgs',
        '/p:CustomAfterMicrosoftCommonTargets=C:\\custom.targets',
      );
    });
  });

  describe('Code Analysis', () => {
    beforeEach(() => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        return null as unknown as string;
      });
    });

    it('should enable RunCodeAnalysis', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'RunCodeAnalysis') return 'true';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:RunCodeAnalysis=true');
    });

    it('should set built-in CodeAnalysisRuleset', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'CodeAnalysisRuleset') return 'AllRules';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:CodeAnalysisRuleset=AllRules.ruleset');
    });

    it('should set custom CodeAnalysisRuleset', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'CodeAnalysisRuleset') return 'Custom';
        return null as unknown as string;
      });
      tlMock.getPathInput.mockImplementation((name) => {
        if (name === 'CodeAnalysisCustomRuleset') return 'C:\\my.ruleset';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:CodeAnalysisRuleset=C:\\my.ruleset');
    });

    it('should set CodeAnalysisTreatWarningsAsErrors', () => {
      tlMock.getBoolInput.mockImplementation((name) => name === 'CodeAnalysisTreatWarningsAsErrors');
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith(
        'MsBuildArgs',
        '/p:CodeAnalysisTreatWarningsAsErrors=true',
      );
    });

    it('should append CodeAnalysisAdditionalArguments', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'CodeAnalysisAdditionalArguments') return '/p:FxCopAnalyzers=true';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:FxCopAnalyzers=true');
    });
  });

  describe('Layer Validation', () => {
    it('should set ValidateArchitecture', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'ValidateArchitecture') return 'true';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:ValidateArchitecture=true');
    });
  });

  describe('ASP.NET', () => {
    beforeEach(() => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        return null as unknown as string;
      });
    });

    it('should set MvcBuildViews', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'MvcBuildViews') return 'true';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:MvcBuildViews=true');
    });

    it('should set Precompile', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'Precompile') return 'true';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith(
        'MsBuildArgs',
        '/t:AspNetPreCompile /p:AspNetCompileMerge=true',
      );
    });

    it('should set EnableUpdateable', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'EnableUpdateable') return 'true';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:EnableUpdateable=true');
    });
  });

  describe('Deploy', () => {
    beforeEach(() => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        return null as unknown as string;
      });
    });

    it('should set DeployOnBuild', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'DeployOnBuild') return 'true';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:DeployOnBuild=true');
    });

    it('should set PackageLocation to BinariesDirectory', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'PackageLocation') return 'BinariesDirectory';
        return null as unknown as string;
      });
      tlMock.getVariable.mockImplementation((name) => {
        if (name === 'Build.BinariesDirectory') return 'C:\\bin';
        return undefined;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:PackageLocation="C:\\bin"');
    });

    it('should set PackageLocation to StagingDirectory', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'PackageLocation') return 'StagingDirectory';
        return null as unknown as string;
      });
      tlMock.getVariable.mockImplementation((name) => {
        if (name === 'Build.StagingDirectory') return 'C:\\staging';
        return undefined;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:PackageLocation="C:\\staging"');
    });

    it('should set custom PackageLocation', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'PackageLocation') return 'Custom';
        return null as unknown as string;
      });
      tlMock.getPathInput.mockImplementation((name) => {
        if (name === 'CustomPackageLocation') return 'C:\\packages';
        return null as unknown as string;
      });
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith('MsBuildArgs', '/p:PackageLocation=C:\\packages');
    });
  });

  describe('combined arguments', () => {
    it('should build a combined MSBuild argument string', () => {
      tlMock.getInput.mockImplementation((name) => {
        if (name === 'variableName') return 'MsBuildArgs';
        if (name === 'MsBuildTreatWarningsAsErrors') return 'true';
        if (name === 'MsBuildMaxCpuCount') return '2';
        return null as unknown as string;
      });
      tlMock.getBoolInput.mockImplementation((name) => name === 'MsBuildTargetBuild');
      run();
      expect(tlMock.setVariable).toHaveBeenCalledWith(
        'MsBuildArgs',
        '/t:Build /p:TreatWarningsAsErrors=true /m:2',
      );
    });
  });
});
