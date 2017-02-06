using System;
using System.IO;
using System.Net.Http;

using JetBrains.Annotations;

using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;


namespace Vme.IntegrationTests
{
	[UsedImplicitly]
	public class WebHostFixture<TStartup> : IDisposable
		where TStartup : class
	{
		[NotNull] private readonly TestServer _server;

		[NotNull]
		public HttpClient Client { get; }

		/// <inheritdoc />
		public WebHostFixture()
		{
			var pathTools = new SolutionPathTools();
			string rootDir = pathTools.FindRepositoryRootDirectory( "VisualMusicExplorer.sln", "solution/" );
			if ( rootDir == null ) throw new DirectoryNotFoundException("Failed to get repository root directory");
			string projectUnderTestDir = pathTools.FindProjectUnderTestDirectory( "Vme", rootDir, "src/" );
			if ( projectUnderTestDir == null ) throw new DirectoryNotFoundException( "Failed to get project under test directory" );

			var hostBuilder = new WebHostBuilder()
				.UseStartup<TStartup>()
				.UseContentRoot( projectUnderTestDir );

			_server = new TestServer( hostBuilder );
			Client = _server.CreateClient();
		}

		/// <inheritdoc />
		public void Dispose()
		{
			_server.Dispose();
			Client.Dispose();
		}
	}
}