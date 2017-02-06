using System.IO;
using System.Reflection;

using JetBrains.Annotations;

using Microsoft.Extensions.PlatformAbstractions;


namespace Vme.IntegrationTests
{
	/// <summary>
	/// Contains tooling to obtain paths in this solution.
	/// </summary>
	public class SolutionPathTools
		//todo: make this class a standalone thing for further reuse
	{

		/// <summary>
		/// Finds full path to a root directory in which the whole solution is contained.
		/// </summary>
		/// <param name="solutionFileName">Name of solution file without a path.</param>
		/// <param name="solutionRelativeDir">Solution file location relative to the root repository directory. Leave empty if solution
		/// is at a root level.</param>
		/// <returns></returns>
		[CanBeNull]
		public string FindRepositoryRootDirectory( string solutionFileName, string solutionRelativeDir = "" )
		{
			string solutionRelativePath = Path.Combine( solutionRelativeDir, solutionFileName );

			var currentDirInfo = new DirectoryInfo( PlatformServices.Default.Application.ApplicationBasePath );
			do
			{
				string solutionFileSearchPath = Path.GetFullPath(Path.Combine( currentDirInfo.FullName, solutionRelativePath ));

				if (File.Exists( solutionFileSearchPath ))
					return currentDirInfo.FullName;

				currentDirInfo = currentDirInfo.Parent;
			}
			while ( currentDirInfo.Parent != null );
			return null;
		}

		[CanBeNull]
		public string FindProjectUnderTestDirectory(
			Assembly assemblyUnderTest,
			string   repositoryRootDirectory,
			string   srcProjectsRelativeDirectory )
		{
			string projectName = assemblyUnderTest.GetName().Name;
			return FindProjectUnderTestDirectory( projectName, repositoryRootDirectory, srcProjectsRelativeDirectory );
		}

		[CanBeNull]
		public string FindProjectUnderTestDirectory(
			string projectUnderTestName,
			string repositoryRootDirectory,
			string srcProjectsRelativeDirectory )
		{
			string projectUnderTestDirectory = Path.GetFullPath(
				Path.Combine( repositoryRootDirectory,  srcProjectsRelativeDirectory, projectUnderTestName ));

			if ( Directory.Exists( projectUnderTestDirectory ))
				return projectUnderTestDirectory;

			return null;
		}
	}
}
